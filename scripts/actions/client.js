import KintoClient from "kinto-client";
import { updatePath } from "redux-simple-router";

import { notifyError, notifySuccess } from "./notifications";
import * as CollectionActions from "./collection";
import * as RecordActions from "./record";
import {
  CLIENT_BUSY,
  SESSION_LIST_BUCKETS_REQUEST,
  COLLECTION_CREATE,
} from "../constants";


export let client;

function getClient({session: {server, username, password}}) {
  return client || new KintoClient(server, {
    headers: {
      Authorization: "Basic " + btoa([username, password].join(":")),
    }
  });
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

function execute(fn) {
  return (dispatch, getState) => {
    dispatch(clientBusy(true));
    const client = getClient(getState());
    return fn(client, dispatch, getState)
      .catch((err) => {
        dispatch(notifyError(err));
      })
      .then(() => {
        dispatch(clientBusy(false));
      });
  };
}

export function listBuckets() {
  return {type: SESSION_LIST_BUCKETS_REQUEST};
}

export function createCollection(bid, collectionData) {
  return {type: COLLECTION_CREATE, bid, collectionData};
}

export function deleteCollection(bid, cid) {
  return execute((client, dispatch, getState) => {
    return client.bucket(bid).deleteCollection(cid)
      .then(({data}) => {
        dispatch(notifySuccess("Collection deleted."));
        dispatch(CollectionActions.collectionDeleted(data));
        dispatch(listBuckets());
        dispatch(updatePath(""));
      });
  });
}

export function loadCollection(bid, cid) {
  return execute((client, dispatch, getState) => {
    return client.bucket(bid).collection(cid).getAttributes()
      .then(({data}) => {
        dispatch(CollectionActions.collectionPropertiesLoaded({
          ...data,
          bucket: bid,
          label: `${bid}/${data.id}`,
        }));
      });
  });
}

export function updateCollection(bid, cid, collectionData) {
  const {schema, uiSchema, displayFields} = collectionData;
  return execute((client, dispatch, getState) => {
    const coll = client.bucket(bid).collection(cid);
    return coll.setMetadata({schema, uiSchema, displayFields})
      .then(({data}) => {
        dispatch(CollectionActions.collectionPropertiesLoaded({
          ...data,
          bucket: bid,
          label: `${bid}/${data.id}`,
        }));
        dispatch(notifySuccess("Collection properties updated."));
      });
  });
}

export function listRecords(bid, cid) {
  return execute((client, dispatch, getState) => {
    const coll = client.bucket(bid).collection(cid);
    return coll.listRecords()
      .then(({data}) => {
        dispatch(CollectionActions.collectionRecordsLoaded(data));
      });
  });
}

export function createRecord(bid, cid, record) {
  return execute((client, dispatch, getState) => {
    const coll = client.bucket(bid).collection(cid);
    return coll.createRecord(record)
      .then(({data}) => {
        dispatch(CollectionActions.collectionRecordCreated(data));
        dispatch(listRecords(bid, cid));
        dispatch(updatePath(`/buckets/${bid}/collections/${cid}`));
        dispatch(notifySuccess("Record added."));
      });
  });
}

export function loadRecord(bid, cid, rid) {
  return execute((client, dispatch, getState) => {
    const coll = client.bucket(bid).collection(cid);
    return coll.getRecord(rid)
      .then(({data}) => {
        dispatch(RecordActions.recordLoaded(data));
      });
  });
}

export function updateRecord(bid, cid, rid, record) {
  return execute((client, dispatch, getState) => {
    const coll = client.bucket(bid).collection(cid);
    return coll.updateRecord({...record, id: rid})
      .then(({data}) => {
        dispatch(RecordActions.resetRecord());
        dispatch(listRecords(bid, cid));
        dispatch(updatePath(`/buckets/${bid}/collections/${cid}`));
        dispatch(notifySuccess("Record updated."));
      });
  });
}

export function deleteRecord(bid, cid, rid) {
  return execute((client, dispatch, getState) => {
    const coll = client.bucket(bid).collection(cid);
    return coll.deleteRecord(rid)
      .then(({data}) => {
        dispatch(listRecords(bid, cid));
        dispatch(updatePath(`/buckets/${bid}/collections/${cid}`));
        dispatch(notifySuccess("Record deleted."));
      });
  });
}

export function bulkCreateRecords(bid, cid, records) {
  return execute((client, dispatch, getState) => {
    const coll = client.bucket(bid).collection(cid);
    return coll.batch((batch) => {
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
          const num = res.published.length;
          dispatch(listRecords(bid, cid));
          dispatch(updatePath(`/buckets/${bid}/collections/${cid}`));
          dispatch(notifySuccess(`${num} records created.`));
        }
      });
  });
}
