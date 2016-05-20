import KintoClient from "kinto-client";
import { call, take, fork, put } from "redux-saga/effects";


const client = new KintoClient("https://kinto.dev.mozaws.net/v1", {
  headers: {
    Authorization: "Basic " + btoa(["test", "test"].join(":")),
  }
});

export function* listBuckets() {
  yield put({type: "SESSION_LIST_BUCKETS_START"});

  const {data} = yield call([client, client.listBuckets]);

  yield put({type: "SESSION_BUCKETS_LIST_LOADED", buckets: data});
}

export default function* watchSessionBuckets() {
  while (yield take("SESSION_LIST_BUCKETS")) {
    yield fork(listBuckets);
  }
}
