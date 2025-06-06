import {
  AUTHENTICATED,
  EVERYONE,
  canCreateBucket,
  canCreateCollection,
  canCreateGroup,
  canCreateRecord,
  canEditBucket,
  canEditCollection,
  canEditGroup,
  canEditRecord,
  formDataToPermissions,
  permissionsToFormData,
} from "@src/permission";

describe("canCreateBucket", () => {
  it("should always return true if no permissions list", () => {
    expect(canCreateBucket(null)).toBe(true);
  });

  it("should return false if root perm is not listed", () => {
    expect(canCreateBucket([{ bucket_id: "xyz" }])).toBe(false);
  });

  it("should return false if perm is not listed", () => {
    const permissions = [{ resource_name: "root", permissions: [] }];
    expect(canCreateBucket(permissions)).toBe(false);
  });

  it("should return true if perm is listed", () => {
    const permissions = [
      { resource_name: "root", permissions: ["bucket:create"] },
    ];
    expect(canCreateBucket(permissions)).toBe(true);
  });
});

describe("canEditBucket", () => {
  it("should always return true if no permissions list", () => {
    expect(canEditBucket(null, "")).toBe(true);
  });

  it("should return false if object is not listed", () => {
    expect(canEditBucket([{ bucket_id: "xyz" }], "abc")).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const permissions = [
      {
        resource_name: "bucket",
        bucket_id: "xyz",
        permissions: ["read"],
      },
    ];
    expect(canEditBucket(permissions, "xyz")).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const permissions = [
      {
        resource_name: "bucket",
        bucket_id: "xyz",
        permissions: ["write"],
      },
    ];
    expect(canEditBucket(permissions, "xyz")).toBe(true);
  });
});

describe("canCreateCollection", () => {
  it("should always return true if no permisssions list", () => {
    expect(canCreateCollection(null, "")).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const permissions = [{ bucket_id: "xyz" }];
    expect(canCreateCollection(permissions, "abc")).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const permissions = [
      {
        resource_name: "bucket",
        bucket_id: "xyz",
        permissions: ["read"],
      },
    ];
    expect(canCreateCollection(permissions, "xyz")).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const permissions = [
      {
        resource_name: "bucket",
        bucket_id: "xyz",
        permissions: ["collection:create"],
      },
    ];
    expect(canCreateCollection(permissions, "xyz")).toBe(true);
  });
});

describe("canCreateGroup", () => {
  it("should always return true if no permisssions list", () => {
    expect(canCreateGroup(null, "")).toBe(true);
  });

  it("should return false if object is not listed", () => {
    expect(canCreateGroup([{ bucket_id: "xyz" }], "abc")).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const permissions = [
      {
        resource_name: "bucket",
        bucket_id: "xyz",
        permissions: ["read"],
      },
    ];
    expect(canCreateGroup(permissions, "xyz")).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const permissions = [
      {
        resource_name: "bucket",
        bucket_id: "xyz",
        permissions: ["group:create"],
      },
    ];
    expect(canCreateGroup(permissions, "xyz")).toBe(true);
  });
});

describe("canEditCollection", () => {
  it("should always return true if no permisssions list", () => {
    expect(canEditCollection(null, "", null)).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const permissions = [{ bucket_id: "abc", collection_id: "foo" }];
    expect(canEditCollection(permissions, "abc", "bar")).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const permissions = [
      {
        resource_name: "collection",
        bucket_id: "xyz",
        collection_id: "foo",
        permissions: ["read"],
      },
    ];
    expect(canEditCollection(permissions, "xyz", "foo")).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const permissions = [
      {
        resource_name: "collection",
        bucket_id: "xyz",
        collection_id: "foo",
        permissions: ["write"],
      },
    ];
    expect(canEditCollection(permissions, "xyz", "foo")).toBe(true);
  });

  it("should return true if permission on bucket is listed", () => {
    const permissions = [
      {
        resource_name: "bucket",
        bucket_id: "xyz",
        permissions: ["write"],
      },
    ];
    expect(canEditCollection(permissions, "xyz", "foo")).toBe(true);
  });
});

describe("canEditGroup", () => {
  it("should always return true if no permisssions list", () => {
    expect(canEditGroup(null, "", "")).toBe(true);
    expect(canEditGroup(null, "", null)).toBe(true);
    expect(canEditGroup(null, "", undefined)).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const permissions = [{ bucket_id: "abc", group_id: "foo" }];
    expect(canEditGroup(permissions, "abc", "bar")).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const permissions = [
      {
        resource_name: "group",
        bucket_id: "xyz",
        group_id: "foo",
        permissions: ["read"],
      },
    ];
    expect(canEditGroup(permissions, "xyz", "foo")).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const permissions = [
      {
        resource_name: "group",
        bucket_id: "xyz",
        group_id: "foo",
        permissions: ["write"],
      },
    ];
    expect(canEditGroup(permissions, "xyz", "foo")).toBe(true);
  });

  it("should return true if permission on bucket is listed", () => {
    const permissions = [
      {
        resource_name: "bucket",
        bucket_id: "xyz",
        permissions: ["write"],
      },
    ];
    expect(canEditGroup(permissions, "xyz", "foo")).toBe(true);
  });
});

describe("canCreateRecord", () => {
  it("should always return true if no permisssions list", () => {
    expect(canCreateRecord(null, "", "")).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const permissions = [{ bucket_id: "abc", collection_id: "foo" }];
    expect(canCreateRecord(permissions, "abc", "bar")).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const permissions = [
      {
        resource_name: "collection",
        bucket_id: "xyz",
        collection_id: "foo",
        permissions: ["read"],
      },
    ];
    expect(canCreateRecord(permissions, "xyz", "foo")).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const permissions = [
      {
        resource_name: "collection",
        bucket_id: "xyz",
        collection_id: "foo",
        permissions: ["record:create"],
      },
    ];
    expect(canCreateRecord(permissions, "xyz", "foo")).toBe(true);
  });

  it("should return true if permission on bucket is listed", () => {
    const permissions = [
      {
        resource_name: "bucket",
        bucket_id: "xyz",
        permissions: ["write"],
      },
    ];
    expect(canCreateRecord(permissions, "xyz", "foo")).toBe(true);
  });
});

describe("canEditRecord", () => {
  it("should always return true if no permisssions list", () => {
    expect(canEditRecord(null, "", "", "")).toBe(true);
  });

  it("should return false if object is not listed", () => {
    const permissions = [
      {
        bucket_id: "abc",
        collection_id: "foo",
        record_id: "pim",
      },
    ];
    expect(canEditRecord(permissions, "abc", "bar", "blah")).toBe(false);
  });

  it("should return false if permission is not listed", () => {
    const permissions = [
      {
        resource_name: "record",
        bucket_id: "xyz",
        collection_id: "foo",
        record_id: "blah",
        permissions: ["read"],
      },
    ];
    expect(canEditRecord(permissions, "xyz", "foo", "blah")).toBe(false);
  });

  it("should return true if permission is listed", () => {
    const permissions = [
      {
        resource_name: "record",
        bucket_id: "xyz",
        collection_id: "foo",
        record_id: "blah",
        permissions: ["write"],
      },
    ];
    expect(canEditRecord(permissions, "xyz", "foo", "blah")).toBe(true);
  });

  it("should return true if permission on bucket is listed", () => {
    const permissions = [
      {
        resource_name: "bucket",
        bucket_id: "xyz",
        permissions: ["write"],
      },
    ];
    expect(canEditRecord(permissions, "xyz", "foo", "blah")).toBe(true);
  });

  it("should return true if permission on collection is listed", () => {
    const permissions = [
      {
        resource_name: "collection",
        bucket_id: "xyz",
        collection_id: "foo",
        permissions: ["write"],
      },
    ];
    expect(canEditRecord(permissions, "xyz", "foo", "blah")).toBe(true);
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
