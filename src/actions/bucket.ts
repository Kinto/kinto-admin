import {
  COLLECTION_CREATE_REQUEST,
  COLLECTION_DELETE_REQUEST,
  COLLECTION_UPDATE_REQUEST,
} from "@src/constants";
import type { CollectionData, CollectionUpdate } from "@src/types";

export function createCollection(
  bid: string,
  collectionData: CollectionData
): {
  type: "COLLECTION_CREATE_REQUEST";
  bid: string;
  collectionData: CollectionData;
} {
  return { type: COLLECTION_CREATE_REQUEST, bid, collectionData };
}

export function updateCollection(
  bid: string,
  cid: string,
  collection: CollectionUpdate
): {
  type: "COLLECTION_UPDATE_REQUEST";
  bid: string;
  cid: string;
  collection: CollectionUpdate;
} {
  return { type: COLLECTION_UPDATE_REQUEST, bid, cid, collection };
}

export function deleteCollection(
  bid: string,
  cid: string
): {
  type: "COLLECTION_DELETE_REQUEST";
  bid: string;
  cid: string;
} {
  return { type: COLLECTION_DELETE_REQUEST, bid, cid };
}
