/* @flow */

import type { Session, Bucket, Collection, GroupState, Record } from "./types";

export const EVERYONE = "System.Everyone";
export const AUTHENTICATED = "System.Authenticated";


const permMethodMap = {
  read: "read",
  write: "write",
  createRecord: "record:create",
  createCollection: "collection:create",
  createGroup: "group:create",
};

export function can(session: Session): Object {
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

export function canEditBucket(session: Session, bucket: Bucket): boolean {
  return can(session).write(bucket);
}

export function canCreateCollection(session: Session, bucket: Bucket): boolean {
  const canSession = can(session);
  return canSession.write(bucket) || canSession.createCollection(bucket);
}

export function canEditCollection(session: Session, collection: Collection): boolean {
  return can(session).write(collection);
}

export function canCreateGroup(session: Session, bucket: Bucket): boolean {
  const canSession = can(session);
  return canSession.write(bucket) || canSession.createGroup(bucket);
}

export function canEditGroup(session: Session, group: GroupState): boolean {
  return can(session).write(group);
}

export function canCreateRecord(session: Session, collection: Collection): boolean {
  const canSession = can(session);
  return canSession.write(collection) || canSession.createRecord(collection);
}

export function canEditRecord(session: Session, record: Record): boolean {
  return can(session).write(record);
}
