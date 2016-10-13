/* @flow */

import type {
  SessionState,
  BucketState,
  CollectionState,
  GroupState,
  RecordState,
} from "./types";

import React from "react";  /* import to enable JSX transpilation */


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
  // You can create a collection if you can write in the bucket or create a collection in it.
  const canSession = can(session);
  return canSession.write(bucket) || canSession.createCollection(bucket);
}

export function canEditCollection(session: SessionState, bucket: BucketState, collection: CollectionState): boolean {
  // You can edit a collection if you can write in the bucket or in the collection.
  return [bucket, collection].some(can(session).write);
}

export function canCreateGroup(session: SessionState, bucket: BucketState): boolean {
  // You can create a group if you can write in the bucket or create a group in it.
  const canSession = can(session);
  return canSession.write(bucket) || canSession.createGroup(bucket);
}

export function canEditGroup(session: SessionState, bucket: BucketState, group: GroupState): boolean {
  // You can edit if you can write in the group or in the bucket
  return [bucket, group].some(can(session).write);
}

export function canCreateRecord(session: SessionState, bucket: BucketState, collection: CollectionState): boolean {
  const canSession = can(session);

  return [
    // You can create if you can write in the collection.
    canSession.write(collection),
    // You can create if you can create a record in the collection.
    canSession.createRecord(collection),
    // You can create if you can write in the bucket
    canSession.write(bucket)
  ].some(condition => condition);
}

export function canEditRecord(session: SessionState, bucket: BucketState, collection: CollectionState, record: RecordState): boolean {
  // You can edit if you can write in the bucket, collection or record
  return [bucket, collection, record].some(can(session).write);
}

/**
 * Transform the permissions object returned by the API into data that can
 * be processed by the form (see `preparePermissionsForm()`).
 * Basically:
 *   ```
 *     {
 *       "write": ["basicauth:cbd37", "github:bob"],
 *       "read": ["system.Everyone"]}
 *     }
 *   ```
 * becomes
 *   ```
 *   {
 *     anonymous: ["read"],
 *     authenticated: [],
 *     principals: [
 *       {principal: "basicauth:cbd37": permissions: ["write"]},
 *       {principals: "github:bob", permissions: ["write"]}
 *     ]
 *   }
 *   ```
 */
export function permissionsToFormData(permissionsObject: Object): Object {
  const formData = Object.keys(permissionsObject)
    .reduce((acc, permissionName) => {
      const principals = permissionsObject[permissionName];
      for (const principal of principals) {
        if (principal === EVERYONE) {
          acc.anonymous = [...acc.anonymous, permissionName];
        }
        else if (principal === AUTHENTICATED) {
          acc.authenticated = [...acc.authenticated, permissionName];
        }
        else {
          let {principals: principalsList} = acc;
          const existing = principalsList.find(x => x.principal === principal);
          if (existing) {
            principalsList = principalsList.map(perm => {
              if (perm.principal === principal) {
                return {
                  ...existing,
                  permissions: [...existing.permissions, permissionName]
                };
              } else {
                return perm;
              }
            });
          } else {
            principalsList = [...principalsList, {principal, permissions: [permissionName]}];
          }
          acc.principals = principalsList;
        }
      }
      return acc;
    }, {
      anonymous: [],
      authenticated: [],
      principals: []
    });

  const {principals} = formData;
  return {
    ...formData,
    // Ensure entries are always listed alphabetically by principals, to avoid
    // confusing UX.
    principals: principals.sort((a, b) => a.principal > b.principal ? 1 : -1)
  };
}

/**
 * Transform the permissions form result into data processable by the API.
 * See `permissionsToFormData()` and `preparePermissionsForm()`.
 */
export function formDataToPermissions(formData: Object) : Object {
  const {anonymous, authenticated, principals} = formData;
  const permissionsList = [
    ...principals,
    {principal: EVERYONE, permissions: anonymous},
    {principal: AUTHENTICATED, permissions: authenticated}];
  return permissionsList.reduce((acc, {principal, permissions}) => {
    for (const permissionName of permissions) {
      if (!acc.hasOwnProperty(permissionName)) {
        acc[permissionName] = [principal];
      } else {
        acc[permissionName] = [...acc[permissionName], principal];
      }
    }
    return acc;
  }, {});
}

export function preparePermissionsForm(permissions: string[]) {
  const apiDocURI = "https://kinto.readthedocs.io/en/stable/api/1.x/permissions.html#api-principals";
  const schema = {
    definitions: {
      permissions: {
        type: "array",
        items: {
          type: "string",
          enum: permissions,
        },
        uniqueItems: true,
      }
    },
    type: "object",
    properties: {
      anonymous: {
        title: "Anonymous",
        description: "Permissions for anyone, including anonymous",
        $ref: "#/definitions/permissions"
      },
      authenticated: {
        title: "Authenticated",
        description: "Permissions for authenticated users",
        $ref: "#/definitions/permissions"
      },
      principals: {
        title: "Principals",
        description: (
          <p>A principal <a href={apiDocURI} target="_blank">can be a user ID or a group URI</a>.
            The write permissions is always granted to the user that edited the object.
          </p>
        ),
        type: "array",
        items: {
          type: "object",
          properties: {
            principal: {type: "string", title: " "},
            permissions: {
              title: "  ",
              $ref: "#/definitions/permissions"
            }
          }
        }
      }
    }
  };

  const uiSchema = {
    anonymous: {
      "ui:widget": "checkboxes",
      classNames: "field-anonymous",
    },
    authenticated: {
      "ui:widget": "checkboxes",
      classNames: "field-authenticated",
    },
    principals: {
      classNames: "field-principals",
      items: {
        principal: {
          classNames: "field-principal",
          "ui:placeholder": "Principal, eg. basicauth:alice, /buckets/x/groups/y"
        },
        permissions: {
          "ui:widget": "checkboxes",
          classNames: "field-permissions",
        }
      }
    },
  };

  return {schema, uiSchema};
}
