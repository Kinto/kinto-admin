import { RJSFSchema, UiSchema } from "@rjsf/utils";
import type { GroupData, PermissionsListEntry } from "@src/types";

export const EVERYONE = "system.Everyone";
export const AUTHENTICATED = "system.Authenticated";

function can(
  permissionsList: PermissionsListEntry[],
  filter: (perm: PermissionsListEntry) => boolean
): boolean {
  // The permissions endpoint is not enabled.
  // Do not try to guess.
  if (!permissionsList) {
    return true;
  }
  const permEntries = permissionsList.filter(filter);
  return permEntries.length > 0;
}

export function canCreateBucket(permissions: PermissionsListEntry[]): boolean {
  return can(permissions, (perm: PermissionsListEntry) => {
    return (
      perm.resource_name == "root" && perm.permissions.includes("bucket:create")
    );
  });
}

export function canEditBucket(
  permissions: PermissionsListEntry[],
  bucketId: string
): boolean {
  return can(permissions, (perm: PermissionsListEntry) => {
    return (
      perm.resource_name == "bucket" &&
      perm.bucket_id == bucketId &&
      perm.permissions.includes("write")
    );
  });
}

export function canCreateCollection(
  permissions: PermissionsListEntry[],
  bucketId: string
): boolean {
  return can(permissions, (perm: PermissionsListEntry) => {
    return (
      perm.resource_name == "bucket" &&
      perm.bucket_id == bucketId &&
      perm.permissions.includes("collection:create")
    );
  });
}

export function canEditCollection(
  permissions: PermissionsListEntry[],
  bucketId: string,
  collectionId: string
): boolean {
  return can(permissions, (perm: PermissionsListEntry) => {
    return (
      (perm.resource_name == "bucket" ||
        (perm.resource_name == "collection" &&
          perm.collection_id == collectionId)) &&
      perm.bucket_id == bucketId &&
      perm.permissions.includes("write")
    );
  });
}

export function canCreateGroup(
  permissions: PermissionsListEntry[],
  bucketId: string
): boolean {
  return can(permissions, (perm: PermissionsListEntry) => {
    return (
      perm.resource_name == "bucket" &&
      perm.bucket_id == bucketId &&
      perm.permissions.includes("group:create")
    );
  });
}

export function canEditGroup(
  permissions: PermissionsListEntry[],
  bucketId: string,
  groupId: string
): boolean {
  return can(permissions, (perm: PermissionsListEntry) => {
    if (!groupId) {
      return false;
    }
    return (
      (perm.resource_name == "bucket" ||
        (perm.resource_name == "group" && perm.group_id == groupId)) &&
      perm.bucket_id == bucketId &&
      perm.permissions.includes("write")
    );
  });
}

export function canCreateRecord(
  permissions: PermissionsListEntry[],
  bucketId: string,
  collectionId: string
): boolean {
  return can(permissions, (perm: PermissionsListEntry) => {
    return (
      ((perm.resource_name == "bucket" && perm.permissions.includes("write")) ||
        (perm.resource_name == "collection" &&
          perm.collection_id == collectionId &&
          perm.permissions.includes("record:create"))) &&
      perm.bucket_id == bucketId
    );
  });
}

export function canEditRecord(
  permissions: PermissionsListEntry[],
  bucketId: string,
  collectionId: string,
  recordId: string
): boolean {
  return can(permissions, (perm: PermissionsListEntry) => {
    return (
      (perm.resource_name == "bucket" ||
        (perm.resource_name == "collection" &&
          perm.collection_id == collectionId) ||
        (perm.resource_name == "record" &&
          perm.collection_id == collectionId &&
          perm.record_id == recordId)) &&
      perm.permissions.includes("write") &&
      perm.bucket_id == bucketId
    );
  });
}

/**
 * Transform the permissions object returned by the API into data that can
 * be processed by the form (see `preparePermissionsForm()`).
 * Basically:
 *   ```
 *     {
 *       "write": ["basicauth:cbd37", "github:bob"],
 *       "read": ["system.Everyone", "/buckets/test/groups/abc"]}
 *     }
 *   ```
 * becomes
 *   ```
 *   {
 *     anonymous: ["read"],
 *     authenticated: [],
 *     groups: {
 *       abs: ["read"]
 *     },
 *     principals: [
 *       {principal: "basicauth:cbd37": permissions: ["write"]},
 *       {principals: "github:bob", permissions: ["write"]}
 *     ]
 *   }
 *   ```
 */
export function permissionsToFormData(
  bid: string,
  permissionsObject: object
): object {
  const groupRegexp = new RegExp(`^/buckets/${bid}/groups/([^/]+)$`);
  const formData = Object.keys(permissionsObject).reduce(
    (acc, permissionName) => {
      const principals = permissionsObject[permissionName];
      for (const principal of principals) {
        if (principal == EVERYONE) {
          acc.anonymous = [...acc.anonymous, permissionName];
        } else if (principal == AUTHENTICATED) {
          acc.authenticated = [...acc.authenticated, permissionName];
        } else if (groupRegexp.test(principal)) {
          const gid = principal.match(groupRegexp)[1];
          acc.groups[gid] = (acc.groups[gid] || []).concat(permissionName);
        } else {
          let { principals: principalsList } = acc;
          const existing = principalsList.find(x => x.principal === principal);
          if (existing) {
            principalsList = principalsList.map(perm => {
              if (perm.principal === principal) {
                return {
                  ...existing,
                  permissions: [...existing.permissions, permissionName],
                };
              } else {
                return perm;
              }
            });
          } else {
            principalsList = [
              ...principalsList,
              { principal, permissions: [permissionName] },
            ];
          }
          acc.principals = principalsList;
        }
      }
      return acc;
    },
    {
      anonymous: [],
      authenticated: [],
      principals: [],
      groups: {},
    }
  );

  const { principals } = formData;
  return {
    ...formData,
    // Ensure entries are always listed alphabetically by principals, to avoid
    // confusing UX.
    principals: principals.sort((a, b) => (a.principal > b.principal ? 1 : -1)),
  };
}

/**
 * Transform the permissions form result into data processable by the API.
 * See `permissionsToFormData()` and `preparePermissionsForm()`.
 */
export function formDataToPermissions(bid: string, formData: object): object {
  const { anonymous, authenticated, groups, principals } = formData as any;
  const fromGeneric = [
    {
      principal: EVERYONE,
      permissions: anonymous,
    },
    {
      principal: AUTHENTICATED,
      permissions: authenticated,
    },
  ];
  const fromGroups = Object.keys(groups).map(gid => ({
    principal: `/buckets/${bid}/groups/${gid}`,
    permissions: groups[gid],
  }));
  const permissionsList = principals.concat(fromGroups).concat(fromGeneric);
  return permissionsList.reduce((acc, { principal, permissions = [] }) => {
    for (const permissionName of permissions) {
      if (!Object.prototype.hasOwnProperty.call(acc, permissionName)) {
        acc[permissionName] = [principal];
      } else {
        acc[permissionName] = [...acc[permissionName], principal];
      }
    }
    return acc;
  }, {});
}

export function preparePermissionsForm(
  permissions: string[],
  groups: GroupData[]
) {
  const schema: RJSFSchema = {
    definitions: {
      permissions: {
        type: "array",
        items: {
          type: "string",
          enum: permissions,
          title: "",
        },
        uniqueItems: true,
      },
    },
    type: "object",
    properties: {
      anonymous: {
        title: "Anonymous",
        description: "Permissions for anyone, including anonymous",
        $ref: "#/definitions/permissions",
      },
      authenticated: {
        title: "Authenticated",
        description: "Permissions for authenticated users",
        $ref: "#/definitions/permissions",
      },
      groups: {
        title: "Groups",
        type: "object",
        properties: {
          ...groups.reduce((acc, group) => {
            const { id: gid } = group;
            acc[gid] = {
              title: gid,
              description: `Permissions for users of the ${gid} group`,
              $ref: "#/definitions/permissions",
            };
            return acc;
          }, {}),
        },
      },
      principals: {
        title: "Principals",
        description:
          "A principal can be a user ID or a group URI. The write permissions is always granted to the user that edited the object.",
        type: "array",
        items: {
          title: "",
          type: "object",
          properties: {
            principal: { type: "string", title: " " },
            permissions: {
              title: "  ",
              $ref: "#/definitions/permissions",
            },
          },
        },
      },
    },
  };

  const groupSchema = {
    "ui:classNames": "field-groups",
  };
  for (const group of groups) {
    groupSchema[group.id] = { "ui:widget": "checkboxes" };
  }

  const uiSchema: UiSchema = {
    anonymous: {
      "ui:widget": "checkboxes",
      "ui:classNames": "field-anonymous",
    },
    authenticated: {
      "ui:widget": "checkboxes",
      "ui:classNames": "field-authenticated",
    },
    principals: {
      "ui:classNames": "field-principals",
      items: {
        principal: {
          "ui:classNames": "field-principal",
          "ui:placeholder":
            "Principal, eg. basicauth:alice, /buckets/x/groups/y",
        },
        permissions: {
          "ui:widget": "checkboxes",
          "ui:classNames": "field-permissions",
        },
      },
    },
    groups: groupSchema,
  };

  return { schema, uiSchema };
}
