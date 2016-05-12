import KintoClient from "kinto-client";


export const SESSION_SETUP_COMPLETE = "SESSION_SETUP_COMPLETE";
export const SESSION_LOGOUT = "SESSION_LOGOUT";
export const SESSION_BUCKETS = "SESSION_BUCKETS";

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
    configureClient(server, username, password);
    dispatch(listBuckets());
    dispatch({
      type: SESSION_SETUP_COMPLETE,
      session,
    });
  };
}

export function listBuckets() {
  return (dispatch) => {
    client.listBuckets()
      .then(({data}) => {
        dispatch(bucketListReceived(data));
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
        dispatch({
          type: SESSION_BUCKETS,
          buckets,
        });
      });
  };
}

export function logout() {
  client = null;
  // XXX Actually we should clear everything loaded for the previous session
  return {
    type: SESSION_LOGOUT,
  };
}
