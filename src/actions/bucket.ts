import {
  COLLECTION_CREATE_REQUEST,
  COLLECTION_DELETE_REQUEST,
  COLLECTION_UPDATE_REQUEST,
  GROUP_CREATE_REQUEST,
  GROUP_DELETE_REQUEST,
  GROUP_UPDATE_REQUEST,
} from "@src/constants";
import type {
  CollectionData,
  CollectionUpdate,
  GroupData,
  GroupUpdate,
} from "@src/types";

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

export function createGroup(
  bid: string,
  groupData: GroupData
): {
  type: "GROUP_CREATE_REQUEST";
  bid: string;
  groupData: GroupData;
} {
  return { type: GROUP_CREATE_REQUEST, bid, groupData };
}

export function updateGroup(
  bid: string,
  gid: string,
  group: GroupUpdate
): {
  type: "GROUP_UPDATE_REQUEST";
  bid: string;
  gid: string;
  group: GroupUpdate;
} {
  return { type: GROUP_UPDATE_REQUEST, bid, gid, group };
}

export function deleteGroup(
  bid: string,
  gid: string
): {
  type: "GROUP_DELETE_REQUEST";
  bid: string;
  gid: string;
} {
  return { type: GROUP_DELETE_REQUEST, bid, gid };
}
