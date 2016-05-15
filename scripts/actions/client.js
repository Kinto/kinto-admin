import KintoClient from "kinto-client";
import { updatePath } from "redux-simple-router";

import { notifyError, notifySuccess } from "./notifications";


export const CLIENT_BUSY = "CLIENT_BUSY";
export const CLIENT_SERVER_INFO_LOADED = "CLIENT_SERVER_INFO_LOADED";
export const CLIENT_BUCKETS_LIST_LOADED = "CLIENT_BUCKETS_LIST_LOADED";
export const CLIENT_COLLECTION_PROPERTIES_LOADED = "CLIENT_COLLECTION_PROPERTIES_LOADED";
export const CLIENT_COLLECTION_CREATED = "CLIENT_COLLECTION_CREATED";
export const CLIENT_COLLECTION_DELETED = "CLIENT_COLLECTION_DELETED";
export const CLIENT_COLLECTION_RECORDS_LOADED = "CLIENT_COLLECTION_RECORDS_LOADED";


let client;

function getClient(getState) {
  if (client) {
    return client;
  }
  const {session} = getState();
  // XXX error handling if no session info is available
  const {server, username, password} = session;
  client = new KintoClient(server, {
    headers: {
      Authorization: "Basic " + btoa([username, password].join(":"))
    }
  });
  return client;
}

export function resetClient() {
  client = null;
}

export function clientBusy(busy) {
  return {
    type: CLIENT_BUSY,
    busy,
  };
}

export function serverInfoLoaded(serverInfo) {
  return {
    type: CLIENT_SERVER_INFO_LOADED,
    serverInfo,
  };
}

export function bucketListLoaded(buckets) {
  return {
    type: CLIENT_BUCKETS_LIST_LOADED,
    buckets,
  };
}

export function collectionCreated(data) {
  return {
    type: CLIENT_COLLECTION_CREATED,
    data,
  };
}

export function collectionPropertiesLoaded(properties) {
  return {
    type: CLIENT_COLLECTION_PROPERTIES_LOADED,
    properties,
  };
}

export function collectionRecordsLoaded(records) {
  return {
    type: CLIENT_COLLECTION_RECORDS_LOADED,
    records,
  };
}

export function collectionDeleted(cid) {
  return {
    type: CLIENT_COLLECTION_DELETED,
    cid,
  };
}

function execute(dispatch, promise) {
  dispatch(clientBusy(true));
  return promise
    .catch((err) => {
      dispatch(notifyError(err));
    })
    .then(() => {
      dispatch(clientBusy(false));
    });
}

export function listBuckets() {
  return (dispatch, getState) => {
    const client = getClient(getState);
    const prom = client.listBuckets()
      .then(({data}) => {
        dispatch(serverInfoLoaded(client.serverInfo));
        return Promise.all(data.map((bucket) => {
          return client.bucket(bucket.id).listCollections()
            .then(({data}) => ({...bucket, collections: data}));
        }));
      })
      .then((buckets) => {
        dispatch(bucketListLoaded(buckets));
      });
    execute(dispatch, prom);
  };
}

export function createCollection(bid, collectionData) {
  const {name, schema, uiSchema, displayFields} = collectionData;
  return (dispatch, getState) => {
    const client = getClient(getState);
    const prom = client.bucket(bid).createCollection(name, {
      data: {uiSchema, schema, displayFields},
    })
      .then(({data}) => {
        dispatch(notifySuccess("Collection created."));
        dispatch(collectionCreated(data));
        dispatch(listBuckets());
      });
    execute(dispatch, prom);
  };
}

export function deleteCollection(bid, cid) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    const prom = client.bucket(bid).deleteCollection(cid)
      .then(({data}) => {
        dispatch(notifySuccess("Collection deleted."));
        dispatch(collectionDeleted(data));
        dispatch(listBuckets());
        dispatch(updatePath(""));
      });
    execute(dispatch, prom);
  };
}

export function loadCollectionProperties(bid, cid) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    const prom = client.bucket(bid).collection(cid).getAttributes()
      .then(({data}) => {
        dispatch(collectionPropertiesLoaded({...data, bucket: bid}));
      });
    execute(dispatch, prom);
  };
}

export function updateCollectionProperties(bid, cid, {schema, uiSchema, displayFields}) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    const coll = client.bucket(bid).collection(cid);
    const prom = Promise.all([
      coll.setSchema(schema),
      coll.setMetadata({uiSchema, displayFields}),
    ])
      .then(([_, {data}]) => {
        dispatch(collectionPropertiesLoaded({...data, bucket: bid}));
        dispatch(notifySuccess("Collection properties updated."));
      });
    execute(dispatch, prom);
  };
}

export function listRecords(bid, cid) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    const coll = client.bucket(bid).collection(cid);
    const prom = coll.listRecords()
      .then(({data}) => {
        dispatch(collectionRecordsLoaded(data));
      });
    execute(dispatch, prom);
  };
}
