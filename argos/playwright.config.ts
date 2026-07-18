import { defineConfig } from "@playwright/test";

// Path is relative to this config file's directory (Playwright's default
// webServer cwd), i.e. `<repo>/argos` → `<repo>/storybook-static`. This is the
// same build the Chromatic workflow uploads (`bun run build-storybook`).
const STORYBOOK_STATIC = "../storybook-static";

const PORT = Number(process.env.ARGOS_PORT ?? 6017);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: ".",
  testMatch: "stories.spec.ts",
  timeout: 90_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 6,
  fullyParallel: true,
  reporter:
    process.env.ARGOS_TOKEN || process.env.CI
      ? [["list"], ["@argos-ci/playwright/reporter"]]
      : "list",
  use: {
    baseURL: BASE_URL,
    // Matches the single `chrome.laptop` configuration in `loki.config.js`, so
    // these captures frame stories the same way the team already reviews them.
    viewport: { width: 1366, height: 768 },
    contextOptions: { reducedMotion: "reduce" },
    launchOptions: {
      // Subpixel (LCD) text antialiasing makes glyph edges vary between runs;
      // disable it so text renders deterministically.
      args: ["--disable-lcd-text", "--font-render-hinting=none"],
    },
  },
  webServer: {
    command: `npx --yes http-server ${STORYBOOK_STATIC} --port ${PORT} --silent`,
    url: `${BASE_URL}/iframe.html`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
