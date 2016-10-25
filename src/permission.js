/* @flow */

import type {
  SessionState,
  BucketState,
  CollectionState,
  GroupState,
  RecordState,
  PermissionsListEntry,
} from "./types";

import React from "react";  /* import to enable JSX transpilation */


export const EVERYONE = "system.Everyone";
export const AUTHENTICATED = "system.Authenticated";


function can(session: SessionState, filter: (perm: PermissionsListEntry) => boolean): boolean {
  const {permissions: permissionsList} = session;
  // The permissions endpoint is not enabled.
  // Do not try to guess.
  if (!permissionsList) {
    return true;
  }
  const permEntries = permissionsList.filter(filter);
  return permEntries.length > 0;
}

export function canEditBucket(session: SessionState, bucket: BucketState): boolean {
  return can(session, (perm: PermissionsListEntry) => {
    return perm.resource_name == "bucket"
        && perm.bucket_id == bucket.data.id
        && perm.permissions.includes("write");
  });
}

export function canCreateCollection(session: SessionState, bucket: BucketState): boolean {
  return can(session, (perm: PermissionsListEntry) => {
    return perm.resource_name == "bucket"
        && perm.bucket_id == bucket.data.id
        && perm.permissions.includes("collection:create");
  });
}

export function canEditCollection(session: SessionState, bucket: BucketState, collection: CollectionState): boolean {
  return can(session, (perm: PermissionsListEntry) => {
    return perm.resource_name == "collection"
        && perm.bucket_id == bucket.data.id
        && perm.collection_id == collection.data.id
        && perm.permissions.includes("write");
  });
}

export function canCreateGroup(session: SessionState, bucket: BucketState): boolean {
  return can(session, (perm: PermissionsListEntry) => {
    return perm.resource_name == "bucket"
        && perm.bucket_id == bucket.data.id
        && perm.permissions.includes("group:create");
  });
}

export function canEditGroup(session: SessionState, bucket: BucketState, group: GroupState): boolean {
  return can(session, (perm: PermissionsListEntry) => {
    return perm.resource_name == "group"
        && perm.bucket_id == bucket.data.id
        && perm.group_id == group.data.id
        && perm.permissions.includes("write");
  });
}

export function canCreateRecord(session: SessionState, bucket: BucketState, collection: CollectionState): boolean {
  return can(session, (perm: PermissionsListEntry) => {
    return perm.resource_name == "collection"
        && perm.bucket_id == bucket.data.id
        && perm.collection_id == collection.data.id
        && perm.permissions.includes("record:create");
  });
}

export function canEditRecord(session: SessionState, bucket: BucketState, collection: CollectionState, record: RecordState): boolean {
  return can(session, (perm: PermissionsListEntry) => {
    return perm.resource_name == "record"
        && perm.bucket_id == bucket.data.id
        && perm.collection_id == collection.data.id
        && perm.record_id == record.data.id
        && perm.permissions.includes("write");
  });
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
        switch (principal) {
          case EVERYONE: {
            acc.anonymous = [...acc.anonymous, permissionName];
            break;
          }
          case AUTHENTICATED: {
            acc.authenticated = [...acc.authenticated, permissionName];
            break;
          }
          default: {
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
