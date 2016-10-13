import { expect } from "chai";

import {
  EVERYONE,
  AUTHENTICATED,
  can,
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


const CURRENT_USER = "fxa:current-user";
const OTHER_USER = "fxa:other-user";


describe("can()", () => {
  describe("Anonymous", () => {
    const session = {authenticated: false, serverInfo: {user: {id: CURRENT_USER}}};

    it("should check if access to a public resource is allowed", () => {
      const collection = {permissions: {read: [EVERYONE]}};

      expect(can(session).read(collection)).eql(true);
    });

    it("should check if access is disallowed", () => {
      const collection = {permissions: {read: [AUTHENTICATED]}};

      expect(can(session).read(collection)).eql(false);
    });
  });

  describe("Authenticated", () => {
    const session = {authenticated: true, serverInfo: {user: {id: CURRENT_USER}}};

    it("should check if access to a resource is allowed for authenticated users", () => {
      const collection = {permissions: {read: [AUTHENTICATED]}};

      expect(can(session).read(collection)).eql(true);
    });

    it("should check if access to a restricted resource is allowed", () => {
      const collection = {permissions: {read: [CURRENT_USER]}};

      expect(can(session).read(collection)).eql(true);
    });

    it("should check if access to a restricted resource is disallowed", () => {
      const collection = {permissions: {read: [OTHER_USER]}};

      expect(can(session).read(collection)).eql(false);
    });
  });
});

describe("canEditBucket", () => {
  const session = {authenticated: true, serverInfo: {user: {id: CURRENT_USER}}};

  it("should check if a bucket can be edited", () => {
    const bucket = {permissions: {write: [CURRENT_USER]}};

    expect(canEditBucket(session, bucket)).eql(true);
  });

  it("should check if a bucket cannot be edited", () => {
    const bucket = {permissions: {write: [OTHER_USER]}};

    expect(canEditBucket(session, bucket)).eql(false);
  });
});

describe("canCreateCollection", () => {
  const session = {authenticated: true, serverInfo: {user: {id: CURRENT_USER}}};

  describe("collection:create permission", () => {
    it("should check if a collection can be created in a bucket", () => {
      const bucket = {permissions: {"collection:create": [CURRENT_USER]}};

      expect(canCreateCollection(session, bucket)).eql(true);
    });

    it("should check if a collection cannot be created in a bucket", () => {
      const bucket = {permissions: {"collection:create": [OTHER_USER]}};

      expect(canCreateCollection(session, bucket)).eql(false);
    });
  });

  describe("write permission", () => {
    it("should check if a collection can be created in a bucket", () => {
      const bucket = {permissions: {write: [CURRENT_USER]}};

      expect(canCreateCollection(session, bucket)).eql(true);
    });

    it("should check if a collection cannot be created in a bucket", () => {
      const bucket = {permissions: {write: [OTHER_USER]}};

      expect(canCreateCollection(session, bucket)).eql(false);
    });
  });
});

describe("canEditCollection", () => {
  const session = {authenticated: true, serverInfo: {user: {id: CURRENT_USER}}};

  it("should check if a collection can be edited", () => {
    const bucket = {permissions: {}};
    const collection = {permissions: {write: [CURRENT_USER]}};

    expect(canEditCollection(session, bucket, collection)).eql(true);
  });

  it("should check if a bucket can be edited", () => {
    const bucket = {permissions: {write: [CURRENT_USER]}};
    const collection = {permissions: {}};

    expect(canEditCollection(session, bucket, collection)).eql(true);
  });

  it("should check if a collection cannot be edited", () => {
    const bucket = {permissions: {write: [OTHER_USER]}};
    const collection = {permissions: {write: [OTHER_USER]}};

    expect(canEditCollection(session, bucket, collection)).eql(false);
  });
});

describe("canCreateGroup", () => {
  const session = {authenticated: true, serverInfo: {user: {id: CURRENT_USER}}};

  describe("group:create permission", () => {
    it("should check if a group can be created in a bucket", () => {
      const bucket = {permissions: {"group:create": [CURRENT_USER]}};

      expect(canCreateGroup(session, bucket)).eql(true);
    });

    it("should check if a group cannot be created in a bucket", () => {
      const bucket = {permissions: {"group:create": [OTHER_USER]}};

      expect(canCreateGroup(session, bucket)).eql(false);
    });
  });

  describe("write permission", () => {
    it("should check if a group can be created in a bucket", () => {
      const bucket = {permissions: {write: [CURRENT_USER]}};

      expect(canCreateGroup(session, bucket)).eql(true);
    });

    it("should check if a group cannot be created in a bucket", () => {
      const bucket = {permissions: {write: [OTHER_USER]}};

      expect(canCreateGroup(session, bucket)).eql(false);
    });
  });
});

describe("canEditGroup", () => {
  const session = {authenticated: true, serverInfo: {user: {id: CURRENT_USER}}};

  it("should check if a group can be edited", () => {
    const bucket = {permissions: {}};
    const group = {permissions: {write: [CURRENT_USER]}};

    expect(canEditGroup(session, bucket, group)).eql(true);
  });

  it("should check if a bucket can be edited", () => {
    const bucket = {permissions: {write: [CURRENT_USER]}};
    const group = {permissions: {}};

    expect(canEditGroup(session, bucket, group)).eql(true);
  });

  it("should check if a group cannot be edited", () => {
    const bucket = {permissions: {write: [OTHER_USER]}};
    const group = {permissions: {write: [OTHER_USER]}};

    expect(canEditGroup(session, bucket, group)).eql(false);
  });
});

describe("canCreateRecord", () => {
  const session = {authenticated: true, serverInfo: {user: {id: CURRENT_USER}}};

  describe("record:create permission", () => {
    it("should check if a record can be created in a collection", () => {
      const bucket = {permissions: {"record:create": [OTHER_USER]}};
      const collection = {permissions: {"record:create": [CURRENT_USER]}};

      expect(canCreateRecord(session, bucket, collection)).eql(true);
    });

    it("should check if a record cannot be created in a collection", () => {
      const bucket = {permissions: {"record:create": [OTHER_USER]}};
      const collection = {permissions: {"record:create": [OTHER_USER]}};

      expect(canCreateRecord(session, bucket, collection)).eql(false);
    });
  });

  describe("collection write permission", () => {
    it("should check if a record can be created in a collection", () => {
      const bucket = {permissions: {write: [OTHER_USER]}};
      const collection = {permissions: {write: [CURRENT_USER]}};

      expect(canCreateRecord(session, bucket, collection)).eql(true);
    });
  });

  describe("bucket write permission", () => {
    it("should check if a record can be created in a collection", () => {
      const bucket = {permissions: {write: [CURRENT_USER]}};
      const collection = {permissions: {write: [OTHER_USER]}};

      expect(canCreateRecord(session, bucket, collection)).eql(true);
    });
  });
});

describe("canEditRecord", () => {
  const session = {authenticated: true, serverInfo: {user: {id: CURRENT_USER}}};

  describe("record write permission", () => {
    it("should check if a record can be edited", () => {
      const bucket = {permissions: {write: [OTHER_USER]}};
      const collection = {permissions: {write: [OTHER_USER]}};
      const record = {permissions: {write: [CURRENT_USER]}};

      expect(canEditRecord(session, bucket, collection, record)).eql(true);
    });

    it("should check if a record cannot be edited", () => {
      const bucket = {permissions: {write: [OTHER_USER]}};
      const collection = {permissions: {write: [OTHER_USER]}};
      const record = {permissions: {write: [OTHER_USER]}};

      expect(canEditRecord(session, bucket, collection, record)).eql(false);
    });
  });

  describe("collection write permission", () => {
    it("should check if a record can be edited", () => {
      const bucket = {permissions: {write: [OTHER_USER]}};
      const collection = {permissions: {write: [CURRENT_USER]}};
      const record = {permissions: {write: [OTHER_USER]}};

      expect(canEditRecord(session, bucket, collection, record)).eql(true);
    });
  });

  describe("bucket write permission", () => {
    it("should check if a record can be edited", () => {
      const bucket = {permissions: {write: [CURRENT_USER]}};
      const collection = {permissions: {write: [OTHER_USER]}};
      const record = {permissions: {write: [OTHER_USER]}};

      expect(canEditRecord(session, bucket, collection, record)).eql(true);
    });
  });
});

describe("Permission form mappers", () => {
  const permissions = {
    read: ["a", "b", "c"],
    write: ["system.Authenticated"],
    "collection:create": ["c"],
    "group:create": ["b"],
    "record:create": ["system.Everyone"],
  };

  const formData = {
    anonymous: ["record:create"],
    authenticated: ["write"],
    principals: [
      {principal: "a", permissions: ["read"]},
      {principal: "b", permissions: ["read", "group:create"]},
      {principal: "c", permissions: ["read", "collection:create"]},
    ]
  };

  describe("permissionsObjectToList", () => {
    it("should convert a permissions object into a list", () => {
      expect(permissionsToFormData(permissions)).eql(formData);
    });
  });

  describe("permissionsListToObject", () => {
    it("should convert a list of permissions into an object", () => {
      expect(formDataToPermissions(formData)).eql(permissions);
    });
  });
});
