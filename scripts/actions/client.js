import KintoClient from "kinto-client";
import { updatePath } from "redux-simple-router";

import { notifyError, notifySuccess } from "./notifications";
import * as CollectionActions from "./collection";
import * as RecordActions from "./record";


export const CLIENT_BUSY = "CLIENT_BUSY";
export const CLIENT_SERVER_INFO_LOADED = "CLIENT_SERVER_INFO_LOADED";
export const CLIENT_BUCKETS_LIST_LOADED = "CLIENT_BUCKETS_LIST_LOADED";


let client;

function getClient(getState) {
  if (client) {
    return client;
  }
  const {session} = getState();
  const {server, username, password} = session;
  if (!server) {
    return null;
  }
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
    // We need to first issue a request to the default bucket in order to create
    // it so we can retrieve the list of buckets.
    // https://github.com/Kinto/kinto/issues/454
    const prom = client.bucket("default").getAttributes()
      .then(() => client.listBuckets())
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
        dispatch(CollectionActions.collectionCreated(data));
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
        dispatch(CollectionActions.collectionDeleted(data));
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
        dispatch(CollectionActions.collectionPropertiesLoaded({
          ...data,
          bucket: bid
        }));
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
        dispatch(CollectionActions.collectionPropertiesLoaded({
          ...data,
          bucket: bid
        }));
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
        dispatch(CollectionActions.collectionRecordsLoaded(data));
      });
    execute(dispatch, prom);
  };
}

export function createRecord(bid, cid, record) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    const coll = client.bucket(bid).collection(cid);
    const prom = coll.createRecord(record)
      .then((data) => {
        dispatch(CollectionActions.collectionRecordCreated(data));
        dispatch(listRecords(bid, cid));
        dispatch(updatePath(`/buckets/${bid}/collections/${cid}`));
        dispatch(notifySuccess("Record added."));
      });
    execute(dispatch, prom);
  };
}

export function loadRecord(bid, cid, rid) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    const coll = client.bucket(bid).collection(cid);
    const prom = coll.getRecord(rid)
      .then(({data}) => {
        dispatch(RecordActions.recordLoaded(data));
      });
    execute(dispatch, prom);
  };
}

export function updateRecord(bid, cid, rid, record) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    const coll = client.bucket(bid).collection(cid);
    const prom = coll.updateRecord({...record, id: rid})
      .then(({data}) => {
        dispatch(RecordActions.resetRecord());
        dispatch(listRecords(bid, cid));
        dispatch(updatePath(`/buckets/${bid}/collections/${cid}`));
        dispatch(notifySuccess("Record updated."));
      });
    execute(dispatch, prom);
  };
}

export function deleteRecord(bid, cid, rid) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    const coll = client.bucket(bid).collection(cid);
    const prom = coll.deleteRecord(rid)
      .then(({data}) => {
        dispatch(RecordActions.resetRecord());
        dispatch(listRecords(bid, cid));
        dispatch(updatePath(`/buckets/${bid}/collections/${cid}`));
        dispatch(notifySuccess("Record deleted."));
      });
    execute(dispatch, prom);
  };
}

export function bulkCreateRecords(bid, cid, records) {
  return (dispatch, getState) => {
    const client = getClient(getState);
    const coll = client.bucket(bid).collection(cid);
    const prom = coll.batch((batch) => {
      for (const record of records) {
        batch.createRecord(record);
      }
    }, {aggregate: true})
      .then((res) => {
        if (res.errors.length > 0) {
          const err = new Error("Some records could not be created.");
          err.details = res.errors.map(err => err.error.message);
          throw err;
        } else {
          dispatch(listRecords(bid, cid));
          dispatch(updatePath(`/buckets/${bid}/collections/${cid}`));
          dispatch(notifySuccess("Records created."));
        }
      });
    execute(dispatch, prom);
  };
}
