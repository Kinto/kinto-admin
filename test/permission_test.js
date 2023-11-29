import {
  AUTHENTICATED,
  EVERYONE,
  canCreateBucket,
  canEditBucket,
  canCreateCollection,
  canEditCollection,
  canCreateGroup,
  canEditGroup,
  canCreateRecord,
  canEditRecord,
  formDataToPermissions,
  permissionsToFormData,
} from "../src/permission";

describe("canCreateBucket", () => {
  it("should always return true if no permissions list", () => {
    const session = { permissions: null };
    expect(canCreateBucket(session)).toBe(true);
  });

  it("should return false if root perm is not listed", () => {
    const session = { permissions: [{ bucket_id: "xyz" }] };
    expect(canCreateBucket(session)).toBe(false);
  });

  it("should return false if perm is not listed", () => {
    const session = {
      permissions: [{ resource_name: "root", permissions: [] }],
    };
    expect(canCreateBucket(session)).toBe(false);
  });

  it("should return true if perm is listed", () => {
    const session = {
      permissions: [{ resource_name: "root", permissions: ["bucket:create"] }],
    };
    expect(canCreateBucket(session)).toBe(true);
  });
});

describe("canEditBucket", () => {
  it("should always return true if no permissions list", () => {
    const session = { permissions: null };
    expect(canEditBucket(session, "")).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const session = { permissions: [{ bucket_id: "xyz" }] };
    expect(canEditBucket(session, "abc")).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "bucket",
          bucket_id: "xyz",
          permissions: ["read"],
        },
      ],
    };
    expect(canEditBucket(session, "xyz")).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "bucket",
          bucket_id: "xyz",
          permissions: ["write"],
        },
      ],
    };
    expect(canEditBucket(session, "xyz")).toBe(true);
  });
});

describe("canCreateCollection", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    expect(canCreateCollection(session, "")).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const session = { permissions: [{ bucket_id: "xyz" }] };
    expect(canCreateCollection(session, "abc")).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "bucket",
          bucket_id: "xyz",
          permissions: ["read"],
        },
      ],
    };
    expect(canCreateCollection(session, "xyz")).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "bucket",
          bucket_id: "xyz",
          permissions: ["collection:create"],
        },
      ],
    };
    expect(canCreateCollection(session, "xyz")).toBe(true);
  });
});

describe("canCreateGroup", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    expect(canCreateGroup(session, "")).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const session = { permissions: [{ bucket_id: "xyz" }] };
    expect(canCreateGroup(session, "abc")).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "bucket",
          bucket_id: "xyz",
          permissions: ["read"],
        },
      ],
    };
    expect(canCreateGroup(session, "xyz")).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "bucket",
          bucket_id: "xyz",
          permissions: ["group:create"],
        },
      ],
    };
    expect(canCreateGroup(session, "xyz")).toBe(true);
  });
});

describe("canEditCollection", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    const collection = {};
    expect(canEditCollection(session, "", collection)).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const session = {
      permissions: [{ bucket_id: "abc", collection_id: "foo" }],
    };
    const collection = { data: { id: "bar" } };
    expect(canEditCollection(session, "abc", collection)).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "collection",
          bucket_id: "xyz",
          collection_id: "foo",
          permissions: ["read"],
        },
      ],
    };
    const collection = { data: { id: "foo" } };
    expect(canEditCollection(session, "xyz", collection)).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "collection",
          bucket_id: "xyz",
          collection_id: "foo",
          permissions: ["write"],
        },
      ],
    };
    const collection = { data: { id: "foo" } };
    expect(canEditCollection(session, "xyz", collection)).toBe(true);
  });

  it("should return true if permission on bucket is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "bucket",
          bucket_id: "xyz",
          permissions: ["write"],
        },
      ],
    };
    const collection = { data: { id: "foo" } };
    expect(canEditCollection(session, "xyz", collection)).toBe(true);
  });
});

describe("canEditGroup", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    const group = {};
    expect(canEditGroup(session, "", group)).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const session = { permissions: [{ bucket_id: "abc", group_id: "foo" }] };
    const group = { data: { id: "bar" } };
    expect(canEditGroup(session, "abc", group)).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "group",
          bucket_id: "xyz",
          group_id: "foo",
          permissions: ["read"],
        },
      ],
    };
    const group = { data: { id: "foo" } };
    expect(canEditGroup(session, "xyz", group)).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "group",
          bucket_id: "xyz",
          group_id: "foo",
          permissions: ["write"],
        },
      ],
    };
    const group = { data: { id: "foo" } };
    expect(canEditGroup(session, "xyz", group)).toBe(true);
  });

  it("should return true if permission on bucket is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "bucket",
          bucket_id: "xyz",
          permissions: ["write"],
        },
      ],
    };
    const group = { data: { id: "foo" } };
    expect(canEditGroup(session, "xyz", group)).toBe(true);
  });
});

describe("canCreateRecord", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    const collection = {};
    expect(canCreateRecord(session, "", collection)).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const session = {
      permissions: [{ bucket_id: "abc", collection_id: "foo" }],
    };
    const collection = { data: { id: "bar" } };
    expect(canCreateRecord(session, "abc", collection)).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "collection",
          bucket_id: "xyz",
          collection_id: "foo",
          permissions: ["read"],
        },
      ],
    };
    const collection = { data: { id: "foo" } };
    expect(canCreateRecord(session, "xyz", collection)).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "collection",
          bucket_id: "xyz",
          collection_id: "foo",
          permissions: ["record:create"],
        },
      ],
    };
    const collection = { data: { id: "foo" } };
    expect(canCreateRecord(session, "xyz", collection)).toBe(true);
  });

  it("should return true if permission on bucket is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "bucket",
          bucket_id: "xyz",
          permissions: ["write"],
        },
      ],
    };
    const collection = { data: { id: "foo" } };
    expect(canCreateRecord(session, "xyz", collection)).toBe(true);
  });
});

describe("canEditRecord", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    const collection = {};
    const record = {};
    expect(canEditRecord(session, "", collection, record)).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const session = {
      permissions: [
        {
          bucket_id: "abc",
          collection_id: "foo",
          record_id: "pim",
        },
      ],
    };
    const collection = { data: { id: "bar" } };
    const record = { data: { id: "blah" } };
    expect(canEditRecord(session, "abc", collection, record)).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "record",
          bucket_id: "xyz",
          collection_id: "foo",
          record_id: "blah",
          permissions: ["read"],
        },
      ],
    };
    const collection = { data: { id: "foo" } };
    const record = { data: { id: "blah" } };
    expect(canEditRecord(session, "xyz", collection, record)).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "record",
          bucket_id: "xyz",
          collection_id: "foo",
          record_id: "blah",
          permissions: ["write"],
        },
      ],
    };
    const collection = { data: { id: "foo" } };
    const record = { data: { id: "blah" } };
    expect(canEditRecord(session, "xyz", collection, record)).toBe(true);
  });

  it("should return true if permission on bucket is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "bucket",
          bucket_id: "xyz",
          permissions: ["write"],
        },
      ],
    };
    const collection = { data: { id: "foo" } };
    const record = { data: { id: "blah" } };
    expect(canEditRecord(session, "xyz", collection, record)).toBe(true);
  });

  it("should return true if permission on collection is listed", () => {
    const session = {
      permissions: [
        {
          resource_name: "collection",
          bucket_id: "xyz",
          collection_id: "foo",
          permissions: ["write"],
        },
      ],
    };
    const collection = { data: { id: "foo" } };
    const record = { data: { id: "blah" } };
    expect(canEditRecord(session, "xyz", collection, record)).toBe(true);
  });
});

describe("Permission form mappers", () => {
  const permissions = {
    read: ["a", "b", "c", "/buckets/test/groups/y"],
    write: [AUTHENTICATED],
    "collection:create": ["/buckets/other/groups/x", "c"],
    "group:create": ["b", "/buckets/test/groups/x", "/buckets/test/groups/y"],
    "record:create": [EVERYONE],
  };

  const formData = {
    anonymous: ["record:create"],
    authenticated: ["write"],
    groups: {
      x: ["group:create"],
      y: ["read", "group:create"],
    },
    principals: [
      {
        principal: "/buckets/other/groups/x",
        permissions: ["collection:create"],
      },
      { principal: "a", permissions: ["read"] },
      { principal: "b", permissions: ["read", "group:create"] },
      { principal: "c", permissions: ["read", "collection:create"] },
    ],
  };

  describe("permissionsToFormData", () => {
    it("should convert a permissions object into a list", () => {
      expect(permissionsToFormData("test", permissions)).toStrictEqual(
        formData
      );
    });
  });

  describe("formDataToPermissions", () => {
    it("should convert a list of permissions into an object", () => {
      expect(formDataToPermissions("test", formData)).toStrictEqual(
        permissions
      );
    });
  });
});
