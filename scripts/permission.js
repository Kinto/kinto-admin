export const EVERYONE = "System.Everyone";
export const AUTHENTICATED = "System.Authenticated";


const permissionApi = {
  read: "read",
  write: "write",
  createRecord: "record:create",
  createCollection: "collection:create",
  createGroup: "group:create",
};

export function can(session={}) {
  const {authenticated=false, serverInfo={}} = session;
  const {user={}} = serverInfo;
  const {id} = user;

  let api = {};

  for (const method in permissionApi) {
    api[method] = (resource) => {
      const permission = permissionApi[method];
      const allowed = resource.permissions[permission] || [];

      return allowed.includes(EVERYONE) ||
        (authenticated && allowed.includes(AUTHENTICATED)) ||
        allowed.includes(id);
    };
  }

  return api;
}

export function canEditBucket(session, bucket) {
  return can(session).write(bucket);
}

export function canCreateCollection(session, bucket) {
  const canSession = can(session);
  return canSession.write(bucket) || canSession.createCollection(bucket);
}

export function canEditCollection(session, collection) {
  return can(session).write(collection);
}

export function canCreateRecord(session, collection) {
  const canSession = can(session);
  return canSession.write(collection) || canSession.createRecord(collection);
}

export function canEditRecord(session, record) {
  return can(session).write(record);
}
