import { expect } from "chai";

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
    expect(canCreateBucket(session)).eql(true);
  });

  it("should return false if root perm is not listed", () => {
    const session = { permissions: [{ bucket_id: "xyz" }] };
    expect(canCreateBucket(session)).eql(false);
  });

  it("should return false if perm is not listed", () => {
    const session = {
      permissions: [{ resource_name: "root", permissions: [] }],
    };
    expect(canCreateBucket(session)).eql(false);
  });

  it("should return true if perm is listed", () => {
    const session = {
      permissions: [{ resource_name: "root", permissions: ["bucket:create"] }],
    };
    expect(canCreateBucket(session)).eql(true);
  });
});

describe("canEditBucket", () => {
  it("should always return true if no permissions list", () => {
    const session = { permissions: null };
    const bucket = {};
    expect(canEditBucket(session, bucket)).eql(true);
  });

  it("should return false if object is not listed", () => {
    const session = { permissions: [{ bucket_id: "xyz" }] };
    const bucket = { data: { id: "abc" } };
    expect(canEditBucket(session, bucket)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    expect(canEditBucket(session, bucket)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    expect(canEditBucket(session, bucket)).eql(true);
  });
});

describe("canCreateCollection", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    const bucket = {};
    expect(canCreateCollection(session, bucket)).eql(true);
  });

  it("should return false if object is not listed", () => {
    const session = { permissions: [{ bucket_id: "xyz" }] };
    const bucket = { data: { id: "abc" } };
    expect(canCreateCollection(session, bucket)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    expect(canCreateCollection(session, bucket)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    expect(canCreateCollection(session, bucket)).eql(true);
  });
});

describe("canCreateGroup", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    const bucket = {};
    expect(canCreateGroup(session, bucket)).eql(true);
  });

  it("should return false if object is not listed", () => {
    const session = { permissions: [{ bucket_id: "xyz" }] };
    const bucket = { data: { id: "abc" } };
    expect(canCreateGroup(session, bucket)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    expect(canCreateGroup(session, bucket)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    expect(canCreateGroup(session, bucket)).eql(true);
  });
});

describe("canEditCollection", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    const bucket = {};
    const collection = {};
    expect(canEditCollection(session, bucket, collection)).eql(true);
  });

  it("should return false if object is not listed", () => {
    const session = {
      permissions: [{ bucket_id: "abc", collection_id: "foo" }],
    };
    const bucket = { data: { id: "abc" } };
    const collection = { data: { id: "bar" } };
    expect(canEditCollection(session, bucket, collection)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    const collection = { data: { id: "foo" } };
    expect(canEditCollection(session, bucket, collection)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    const collection = { data: { id: "foo" } };
    expect(canEditCollection(session, bucket, collection)).eql(true);
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
    const bucket = { data: { id: "xyz" } };
    const collection = { data: { id: "foo" } };
    expect(canEditCollection(session, bucket, collection)).eql(true);
  });
});

describe("canEditGroup", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    const bucket = {};
    const group = {};
    expect(canEditGroup(session, bucket, group)).eql(true);
  });

  it("should return false if object is not listed", () => {
    const session = { permissions: [{ bucket_id: "abc", group_id: "foo" }] };
    const bucket = { data: { id: "abc" } };
    const group = { data: { id: "bar" } };
    expect(canEditGroup(session, bucket, group)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    const group = { data: { id: "foo" } };
    expect(canEditGroup(session, bucket, group)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    const group = { data: { id: "foo" } };
    expect(canEditGroup(session, bucket, group)).eql(true);
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
    const bucket = { data: { id: "xyz" } };
    const group = { data: { id: "foo" } };
    expect(canEditGroup(session, bucket, group)).eql(true);
  });
});

describe("canCreateRecord", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    const bucket = {};
    const collection = {};
    expect(canCreateRecord(session, bucket, collection)).eql(true);
  });

  it("should return false if object is not listed", () => {
    const session = {
      permissions: [{ bucket_id: "abc", collection_id: "foo" }],
    };
    const bucket = { data: { id: "abc" } };
    const collection = { data: { id: "bar" } };
    expect(canCreateRecord(session, bucket, collection)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    const collection = { data: { id: "foo" } };
    expect(canCreateRecord(session, bucket, collection)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    const collection = { data: { id: "foo" } };
    expect(canCreateRecord(session, bucket, collection)).eql(true);
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
    const bucket = { data: { id: "xyz" } };
    const collection = { data: { id: "foo" } };
    expect(canCreateRecord(session, bucket, collection)).eql(true);
  });
});

describe("canEditRecord", () => {
  it("should always return true if no permisssions list", () => {
    const session = { permissions: null };
    const bucket = {};
    const collection = {};
    const record = {};
    expect(canEditRecord(session, bucket, collection, record)).eql(true);
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
    const bucket = { data: { id: "abc" } };
    const collection = { data: { id: "bar" } };
    const record = { data: { id: "blah" } };
    expect(canEditRecord(session, bucket, collection, record)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    const collection = { data: { id: "foo" } };
    const record = { data: { id: "blah" } };
    expect(canEditRecord(session, bucket, collection, record)).eql(false);
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
    const bucket = { data: { id: "xyz" } };
    const collection = { data: { id: "foo" } };
    const record = { data: { id: "blah" } };
    expect(canEditRecord(session, bucket, collection, record)).eql(true);
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
    const bucket = { data: { id: "xyz" } };
    const collection = { data: { id: "foo" } };
    const record = { data: { id: "blah" } };
    expect(canEditRecord(session, bucket, collection, record)).eql(true);
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
    const bucket = { data: { id: "xyz" } };
    const collection = { data: { id: "foo" } };
    const record = { data: { id: "blah" } };
    expect(canEditRecord(session, bucket, collection, record)).eql(true);
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
      expect(permissionsToFormData("test", permissions)).eql(formData);
    });
  });

  describe("formDataToPermissions", () => {
    it("should convert a list of permissions into an object", () => {
      expect(formDataToPermissions("test", formData)).eql(permissions);
    });
  });
});
