import { useEffect } from "react";

import { useUserKeyValue } from "metabase/common/hooks/use-user-key-value";
import { useSelector } from "metabase/redux";
import { getLocation } from "metabase/selectors/routing";

import { getDataStudioTopLevelRoute } from "./utils";

export function useDataStudioRoutePersistence() {
  const { pathname } = useSelector(getLocation);
  const { setValue: setHasVisited } = useUserKeyValue({
    namespace: "data_studio",
    key: "hasVisitedDataStudio",
    defaultValue: false,
  });
  const { setValue: setLastTopLevelRoute } = useUserKeyValue({
    namespace: "data_studio",
    key: "lastTopLevelRoute",
  });

  useEffect(() => {
    const topLevelRoute = getDataStudioTopLevelRoute(pathname);
    if (topLevelRoute == null) {
      return;
    }

    void setLastTopLevelRoute(topLevelRoute);
    void setHasVisited(true);
  }, [pathname, setHasVisited, setLastTopLevelRoute]);
}
