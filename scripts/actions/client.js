import KintoClient from "kinto-client";
import { updatePath } from "redux-simple-router";

import { notifyError, notifySuccess } from "./notifications";


export const CLIENT_SERVER_INFO_LOADED = "CLIENT_SERVER_INFO_LOADED";
export const CLIENT_BUCKETS_LIST_LOADED = "CLIENT_BUCKETS_LIST_LOADED";
export const CLIENT_COLLECTION_PROPERTIES_LOADED = "CLIENT_COLLECTION_PROPERTIES_LOADED";
export const CLIENT_COLLECTION_CREATED = "CLIENT_COLLECTION_CREATED";


export function serverInfoLoaded(serverInfo) {
  return {
    type: CLIENT_SERVER_INFO_LOADED,
    serverInfo
  };
}

export function bucketListLoaded(buckets) {
  return {
    type: CLIENT_BUCKETS_LIST_LOADED,
    buckets
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

function getClient(getState) {
  const {session} = getState();
  // XXX error handling if no session info is available
  const {server, username, password} = session;
  return new KintoClient(server, {
    headers: {
      Authorization: "Basic " + btoa([username, password].join(":"))
    }
  });
}

function execute(dispatch, promise) {
  return promise.catch((err) => {
    dispatch(notifyError(err));
  });
}

export function listBuckets() {
  return (dispatch, getState) => {
    const client = getClient(getState);
    execute(dispatch, client.listBuckets())
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
  };
}

export function createCollection(bid, collectionData) {
  const {name, schema, uiSchema, displayFields} = collectionData;
  return (dispatch, getState) => {
    const client = getClient(getState);
    execute(dispatch, client.bucket(bid).createCollection(name, {
      data: {uiSchema, displayFields},
      schema,
    }))
      .then(({data}) => {
        dispatch(notifySuccess("Collection created."));
        dispatch(collectionCreated(data));
        dispatch(listBuckets());
      });
  };
}

export function deleteCollection(bid, cid) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    execute(dispatch, client.bucket(bid).deleteCollection(cid))
      .then(() => {
        dispatch(listBuckets());
        dispatch(updatePath(""));
        dispatch(notifySuccess("Collection deleted."));
      });
  };
}

export function loadCollectionProperties(bid, cid) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    execute(dispatch, client.bucket(bid).collection(cid).getAttributes())
      .then(({data}) => {
        dispatch(collectionPropertiesLoaded({...data, bucket: bid}));
      });
  };
}

export function updateCollectionProperties(bid, cid, {schema, uiSchema, displayFields}) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    const coll = client.bucket(bid).collection(cid);
    const prom = Promise.all([
      coll.setSchema(schema),
      coll.setMetadata({uiSchema, displayFields}),
    ]);
    execute(dispatch, prom)
      .then(([_, {data}]) => {
        dispatch(collectionPropertiesLoaded({...data, bucket: bid}));
        dispatch(notifySuccess("Collection properties updated."));
      });
  };
}
