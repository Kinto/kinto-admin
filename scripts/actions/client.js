import KintoClient from "kinto-client";
import { updatePath } from "redux-simple-router";

import { notifyError, notifySuccess } from "./notifications";
import * as CollectionActions from "./collection";
import * as RecordActions from "./record";
import {
  CLIENT_BUSY,
  SESSION_LIST_BUCKETS_REQUEST,
  COLLECTION_CREATE_REQUEST,
  COLLECTION_DELETE_REQUEST,
  COLLECTION_LOAD_REQUEST,
  COLLECTION_UPDATE_REQUEST,
  COLLECTION_RECORDS_REQUEST,
  RECORD_LOAD_REQUEST,
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

export function loadCollection(bid, cid) {
  return {type: COLLECTION_LOAD_REQUEST, bid, cid};
}

export function createCollection(bid, collectionData) {
  return {type: COLLECTION_CREATE_REQUEST, bid, collectionData};
}

export function updateCollection(bid, cid, collectionData) {
  return {type: COLLECTION_UPDATE_REQUEST, bid, cid, collectionData};
}

export function deleteCollection(bid, cid) {
  return {type: COLLECTION_DELETE_REQUEST, bid, cid};
}

export function listRecords(bid, cid) {
  return {type: COLLECTION_RECORDS_REQUEST, bid, cid};
}

export function loadRecord(bid, cid, rid) {
  return {type: RECORD_LOAD_REQUEST, bid, cid, rid};
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
