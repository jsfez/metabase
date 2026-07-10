(ns metabase.user-key-value.data-studio-test
  (:require
   [clojure.test :refer :all]
   [metabase.test :as mt]
   [metabase.user-key-value.models.user-key-value.types :as user-kv.types]))

;; Load production schemas so we validate against the real data_studio schema.
(user-kv.types/load-all-schemas-prod! "user_key_value_types")

(deftest data-studio-key-values-test
  (mt/with-model-cleanup [:model/UserKeyValue]
    (testing "can store boolean and string preferences in the data_studio namespace"
      (is (= true
             (mt/user-http-request :rasta :put 200
                                   "/user-key-value/namespace/data_studio/key/hasVisitedDataStudio"
                                   {:value true})))
      (is (= true
             (mt/user-http-request :rasta :get 200
                                   "/user-key-value/namespace/data_studio/key/hasVisitedDataStudio")))
      (is (= "/data-studio/data"
             (mt/user-http-request :rasta :put 200
                                   "/user-key-value/namespace/data_studio/key/lastTopLevelRoute"
                                   {:value "/data-studio/data"})))
      (is (= "/data-studio/data"
             (mt/user-http-request :rasta :get 200
                                   "/user-key-value/namespace/data_studio/key/lastTopLevelRoute"))))))
