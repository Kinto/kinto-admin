import KintoClient from "kinto-client";
import { call, put } from "redux-saga";

import { SESSION_BUCKETS_LIST_LOADED } from "../constants";


const client = new KintoClient("https://kinto.dev.mozaws.com/v1", {
  headers: {
    Authorization: "Basic " + btoa(["test", "test"].join(":")),
  }
});

export function* listBuckets() {
  const {data} = yield call([client, client.listBuckets]);
  yield put({type: SESSION_BUCKETS_LIST_LOADED, buckets: data});
}
