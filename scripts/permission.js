/* @flow */

import type Record from "./reducers/record";

export const EVERYONE = "System.Everyone";
export const AUTHENTICATED = "System.Authenticated";


const permMethodMap = {
  read: "read",
  write: "write",
  createRecord: "record:create",
  createCollection: "collection:create",
  createGroup: "group:create",
};

// type PermissionApi = {
//   read: (resource: Object) => boolean,
//   write: (resource: Object) => boolean,
//   createRecord: (resource: Object) => boolean,
//   createCollection: (resource: Object) => boolean,
//   createGroup: (resource: Object) => boolean,
// };

export function can(session: Object={}): Object {
  const {authenticated=false, serverInfo={}} = session;
  const {user={}} = serverInfo;
  const {id} = user;

  let api = {};

  for (const method: string in permMethodMap) {
    api[method] = (resource) => {
      const permission: string = permMethodMap[method];
      const allowed: Array<string> = resource.permissions[permission] || [];

      return allowed.includes(EVERYONE) ||
        (authenticated && allowed.includes(AUTHENTICATED)) ||
        allowed.includes(id);
    };
  }

  return api;
}

export function canEditBucket(session: Object, bucket: Object) {
  return can(session).write(bucket);
}

export function canCreateCollection(session: Object, bucket: Object) {
  const canSession = can(session);
  return canSession.write(bucket) || canSession.createCollection(bucket);
}

export function canEditCollection(session: Object, collection: Object) {
  return can(session).write(collection);
}

export function canCreateRecord(session: Object, collection: Object) {
  const canSession = can(session);
  return canSession.write(collection) || canSession.createRecord(collection);
}

export function canEditRecord(session: Object, record: Record) {
  return can(session).write(record);
}
