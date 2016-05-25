import {
  BUCKET_CREATE_REQUEST,
  BUCKET_DELETE_REQUEST,
  COLLECTION_LOAD_REQUEST,
  COLLECTION_CREATE_REQUEST,
  COLLECTION_UPDATE_REQUEST,
  COLLECTION_DELETE_REQUEST,
} from "../constants";



export function createBucket(bid) {
  return {type: BUCKET_CREATE_REQUEST, bid};
}

export function deleteBucket(bid) {
  return {type: BUCKET_DELETE_REQUEST, bid};
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
