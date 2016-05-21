import KintoClient from "kinto-client";
import { call, take, fork, put } from "redux-saga/effects";


let client;

function setupClient({server, username, password}) {
  client = new KintoClient(server, {
    headers: {
      Authorization: "Basic " + btoa([username, password].join(":")),
    }
  });
}

export function* setupSession(session) {
  yield put({type: "NOTIFICATION_CLEAR", force: true});
  setupClient(session);
  yield fetchServerInfo();
  yield listBuckets();
  yield put({type: "SESSION_SETUP_COMPLETE", session});
}

export function* fetchServerInfo() {
  try {
    const serverInfo = yield call([client, client.fetchServerInfo]);
    yield put({type: "SESSION_SERVERINFO_SUCCESS", serverInfo});
  } catch(error) {
    yield put({type: "SESSION_SERVERINFO_FAILURE", error});
  }
}

export function* listBuckets() {
  try {
    let buckets = [];
    const {data} = yield call([client, client.listBuckets]);
    for (const {id} of data) {
      const bucket = client.bucket(id);
      const {data} = yield call([bucket, bucket.listCollections], id);
      buckets.push({id, collections: data});
    }
    yield put({type: "SESSION_LIST_BUCKETS_SUCCESS", buckets});
  } catch(error) {
    yield put({type: "SESSION_LIST_BUCKETS_FAILURE", error});
  }
}

// Watchers

export function* watchSessionSetup() {
  while(true) {
    const {session} = yield take("SESSION_SETUP");
    yield fork(setupSession, session);
  }
}

export function* watchSessionBuckets() {
  while(yield take("SESSION_LIST_BUCKETS_REQUEST")) {
    yield fork(listBuckets);
  }
}

// Root saga

export default function* rootSaga() {
  yield [
    fork(watchSessionSetup),
    fork(watchSessionBuckets),
  ];
}
