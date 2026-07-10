import { useEffect } from "react";
import { replace } from "react-router-redux";
import { t } from "ttag";

import { useUserKeyValue } from "metabase/common/hooks/use-user-key-value";
import { useDispatch } from "metabase/redux";
import { Center, Loader } from "metabase/ui";
import * as Urls from "metabase/urls";

export function DataStudioIndexRedirect() {
  const dispatch = useDispatch();
  const { value: hasVisited, isLoading: isLoadingVisited } = useUserKeyValue({
    namespace: "data_studio",
    key: "hasVisitedDataStudio",
    defaultValue: false,
  });
  const { value: lastTopLevelRoute, isLoading: isLoadingRoute } =
    useUserKeyValue({
      namespace: "data_studio",
      key: "lastTopLevelRoute",
    });

  useEffect(() => {
    if (isLoadingVisited || isLoadingRoute) {
      return;
    }

    const destination = hasVisited
      ? (lastTopLevelRoute ?? Urls.dataStudioGuide())
      : Urls.dataStudioGuide();

    dispatch(replace(destination));
  }, [
    dispatch,
    hasVisited,
    isLoadingRoute,
    isLoadingVisited,
    lastTopLevelRoute,
  ]);

  return (
    <Center h="100%" aria-label={t`Loading Data Studio`}>
      <Loader />
    </Center>
  );
}
