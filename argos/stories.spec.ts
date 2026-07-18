import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { argosScreenshot } from "@argos-ci/playwright";
import { test, type Page } from "@playwright/test";

type StoryEntry = {
  id: string;
  title: string;
  name: string;
  type: string;
};

type StoryIndex = { entries: Record<string, StoryEntry> };

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

const index: StoryIndex = JSON.parse(
  readFileSync(join(repoRoot, "storybook-static/index.json"), "utf-8"),
);

const only = process.env.ARGOS_ONLY?.split(",").map((s) => s.trim());

// No story in the repo sets `parameters.chromatic`, so the Chromatic workflow
// captures the whole Storybook. Mirror that: every story entry, no opt-in list
// to keep in sync.
const stories = Object.values(index.entries).filter(
  (entry) => entry.type === "story" && (!only || only.includes(entry.id)),
);

// Loading indicators legitimately keep `aria-busy='true'` for as long as they
// are rendered, so waiting for it to clear never settles on their stories.
const LOADER = /load(ing|er)|skeleton|spinner|progress|busy/i;

// Wait for Storybook's own render cycle. Storybook 8+ exposes the active
// renders on `__STORYBOOK_PREVIEW__.storyRenders`; match the one for this
// story (fall back to the latest). Some stories render in a portal and leave
// #storybook-root empty, so don't wait on the root itself.
const waitForStoryRendered = (page: Page, storyId: string): Promise<unknown> =>
  page.waitForFunction((id) => {
    const renders =
      (
        window as unknown as {
          __STORYBOOK_PREVIEW__?: { storyRenders?: { id?: string; phase?: string }[] };
        }
      ).__STORYBOOK_PREVIEW__?.storyRenders ?? [];
    const render = renders.find((r) => r.id === id) ?? renders[renders.length - 1];
    return render?.phase === "completed" || render?.phase === "finished";
  }, storyId);

for (const story of stories) {
  test(`${story.title} › ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await waitForStoryRendered(page, story.id);

    // `.storybook/preview.tsx` already forces every registered font to load
    // before a story renders, but the capture runs outside that loader — wait
    // again here, then nudge the viewport one pixel and back so ResizeObserver
    // consumers (table column autosize) re-measure with final font metrics.
    await page.evaluate(() => document.fonts.ready);
    const viewport = page.viewportSize();
    if (viewport) {
      await page.setViewportSize({ ...viewport, width: viewport.width + 1 });
      await page.setViewportSize(viewport);
    }

    // Wait until the story markup holds still across two consecutive samples,
    // capped so endlessly looping stories still capture. This catches
    // JS-driven animation that neither `prefers-reduced-motion` nor CSS
    // animation stabilization covers — ECharts in particular renders its
    // series over several frames.
    let previousMarkup = "";
    let stableSamples = 0;
    for (let i = 0; i < 40 && stableSamples < 2; i++) {
      const markup = await page.evaluate(() => document.body.innerHTML);
      stableSamples = markup === previousMarkup ? stableSamples + 1 : 0;
      previousMarkup = markup;
      if (stableSamples < 2) await page.waitForTimeout(250);
    }

    // Scrollable containers (long tables, overflowing lists) may settle on a
    // non-deterministic offset: pin every scroll position before capturing.
    await page.evaluate(() => {
      for (const el of Array.from(document.querySelectorAll("*"))) {
        if (el.scrollLeft !== 0) el.scrollLeft = 0;
        if (el.scrollTop !== 0) el.scrollTop = 0;
      }
    });

    // SVG SMIL animations (`<animate>`) ignore `prefers-reduced-motion` and
    // aren't covered by Argos's animation stabilization, so a capture lands at
    // an arbitrary point of the timeline. Rewind them to their base state and
    // pause.
    await page.evaluate(() => {
      for (const svg of Array.from(document.querySelectorAll("svg"))) {
        if (typeof svg.pauseAnimations !== "function") continue;
        svg.setCurrentTime(0);
        svg.pauseAnimations();
      }
    });

    const isLoader = LOADER.test(`${story.title} ${story.name}`);
    await argosScreenshot(page, story.id, {
      stabilize: { waitForAriaBusy: !isLoader },
    });
  });
}
