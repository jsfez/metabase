import fetchMock from "fetch-mock";

import { setupUserKeyValueEndpoints } from "__support__/server-mocks";
import { renderWithProviders, screen, waitFor } from "__support__/ui";
import { Route } from "metabase/router";
import * as Urls from "metabase/urls";

import { DataStudioIndexRedirect } from "./DataStudioIndexRedirect";

function setupKeyValues({
  hasVisited = false,
  lastTopLevelRoute = null,
}: {
  hasVisited?: boolean;
  lastTopLevelRoute?: string | null;
} = {}) {
  setupUserKeyValueEndpoints({
    namespace: "data_studio",
    key: "hasVisitedDataStudio",
    value: hasVisited,
  });
  setupUserKeyValueEndpoints({
    namespace: "data_studio",
    key: "lastTopLevelRoute",
    value: lastTopLevelRoute,
  });
}

function setup() {
  return renderWithProviders(
    <Route path="/data-studio" component={DataStudioIndexRedirect} />,
    {
      withRouter: true,
      initialRoute: "/data-studio",
    },
  );
}

describe("DataStudioIndexRedirect", () => {
  beforeEach(() => {
    fetchMock.removeRoutes();
    fetchMock.clearHistory();
  });

  it("redirects first-time visitors to the guide", async () => {
    setupKeyValues({ hasVisited: false, lastTopLevelRoute: null });
    const { history } = setup();

    await waitFor(() => {
      expect(history?.getCurrentLocation().pathname).toBe(
        Urls.dataStudioGuide(),
      );
    });
  });

  it("redirects returning visitors to their last top-level route", async () => {
    setupKeyValues({
      hasVisited: true,
      lastTopLevelRoute: Urls.dataStudioData(),
    });
    const { history } = setup();

    await waitFor(() => {
      expect(history?.getCurrentLocation().pathname).toBe(
        Urls.dataStudioData(),
      );
    });
  });

  it("falls back to the guide when returning visitors have no saved route", async () => {
    setupKeyValues({ hasVisited: true, lastTopLevelRoute: null });
    const { history } = setup();

    await waitFor(() => {
      expect(history?.getCurrentLocation().pathname).toBe(
        Urls.dataStudioGuide(),
      );
    });
  });

  it("shows a loading state while redirect preferences are loading", () => {
    setupKeyValues();
    setup();

    expect(screen.getByLabelText("Loading Data Studio")).toBeInTheDocument();
  });
});
