/* @flow */

import type {
  SessionState,
  BucketState,
  CollectionState,
  GroupState,
  RecordState,
} from "./types";

export const EVERYONE = "System.Everyone";
export const AUTHENTICATED = "System.Authenticated";


const permMethodMap = {
  read: "read",
  write: "write",
  createRecord: "record:create",
  createCollection: "collection:create",
  createGroup: "group:create",
};

export function can(session: SessionState): Object {
  const {authenticated, serverInfo} = session;
  const {user={}} = serverInfo;

  let api = {};

  for (const method: string in permMethodMap) {
    api[method] = (resource) => {
      const permission: string = permMethodMap[method];
      const allowed: string[] = resource.permissions[permission] || [];

      return allowed.includes(EVERYONE) ||
        (authenticated && allowed.includes(AUTHENTICATED)) ||
        (user && user.id && allowed.includes(user.id));
    };
  }

  return api;
}

export function canEditBucket(session: SessionState, bucket: BucketState): boolean {
  // You can edit a bucket if you can write in it.
  return can(session).write(bucket);
}

export function canCreateCollection(session: SessionState, bucket: BucketState): boolean {
  // You can createa a collection if you can write in the bucket or create a collection in it.
  const canSession = can(session);
  return canSession.write(bucket) || canSession.createCollection(bucket);
}

export function canEditCollection(session: SessionState, collection: CollectionState, bucket: BucketState): boolean {
  // You can create a group if you can write in the bucket or create a group in it.
  const canSession = can(session);
  return canSession.write(collection) || canSession.write(bucket);
}

export function canCreateGroup(session: SessionState, bucket: BucketState): boolean {
  // You can create a group if you can write in the bucket or create a group in it.
  const canSession = can(session);
  return canSession.write(bucket) || canSession.createGroup(bucket);
}

export function canEditGroup(session: SessionState, group: GroupState, bucket: BucketState): boolean {
  // You can edit if you can write in the group or in the bucket
  const canSession = can(session);
  return canSession.write(group) || canSession.write(bucket);
}

export function canCreateRecord(session: SessionState, collection: CollectionState, bucket: BucketState): boolean {
  const canSession = can(session);

  // You can edit if you can write in the collection or create a record in it.
  let canCreate = canSession.write(collection) || canSession.createRecord(collection);

  // You can edit if you can write in the bucket
  if (typeof bucket !== 'undefined') {
    canCreate = canCreate || canSession.write(bucket)
  }
  return canCreate;
}

export function canEditRecord(session: SessionState, record: RecordState, collection: CollectionState, bucket: BucketState): boolean {
  const canSession = can(session);

  // You can edit if you can write in the record
  let canEdit = canSession.write(record);

  // You can edit if you can write in the collection
  canEdit = canEdit || canSession.write(collection)

  // You can edit if you can write in the bucket
  canEdit = canEdit || canSession.write(bucket)

  return canEdit;
}
