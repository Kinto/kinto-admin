import KintoClient from "kinto-client";

import { notifyError, notifySuccess, clearNotifications } from "./notifications";


export const SESSION_SETUP_COMPLETE = "SESSION_SETUP_COMPLETE";
export const SESSION_LOGOUT = "SESSION_LOGOUT";
export const SESSION_BUCKETS = "SESSION_BUCKETS";
export const SESSION_SERVER_INFO = "SESSION_SERVER_INFO";

let client;

function configureClient(server, username, password) {
  client = new KintoClient(server, {
    headers: {
      Authorization: "Basic " + btoa([username, password].join(":"))
    }
  });
}

export function setup(session) {
  const {server, username, password} = session;
  // Load buckets for this user
  return (dispatch) => {
    dispatch(clearNotifications());
    try {
      configureClient(server, username, password);
      dispatch(listBuckets());
      dispatch({type: SESSION_SETUP_COMPLETE, session});
    } catch(err) {
      dispatch(notifyError(err));
    }
  };
}

export function listBuckets() {
  return (dispatch) => {
    client.listBuckets()
      .then(({data}) => {
        dispatch(updateServerInfo(client.serverInfo));
        dispatch(bucketListReceived(data));
      })
      .catch(err => {
        dispatch(notifyError(err));
      });
  };
}

export function bucketListReceived(buckets) {
  return (dispatch) => {
    Promise.all(buckets.map((bucket) => {
      return client.bucket(bucket.id).listCollections()
        .then(({data}) => ({...bucket, collections: data}));
    }))
      .then((buckets) => {
        dispatch({type: SESSION_BUCKETS, buckets});
      })
      .catch(err => {
        dispatch(notifyError(err));
      });
  };
}

export function createCollection(bucket, collectionData) {
  const {name} = collectionData;
  return (dispatch) => {
    dispatch(clearNotifications());
    client.bucket(bucket).createCollection(name)
      .then(() => {
        dispatch(notifySuccess("Collection created."));
        dispatch(listBuckets());
      })
      .catch(err => {
        dispatch(notifyError(err));
      });
  };
}

export function updateServerInfo(serverInfo) {
  return {
    type: SESSION_SERVER_INFO,
    serverInfo,
  };
}

export function logout() {
  client = null;
  return {
    type: SESSION_LOGOUT,
  };
}
