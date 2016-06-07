import { expect } from "chai";

import {
  EVERYONE,
  AUTHENTICATED,
  can,
  canEditBucket,
  canCreateCollection,
  canEditCollection,
  canCreateRecord,
  canEditRecord,
} from "../scripts/permission";


describe("can()", () => {
  describe("Anonymous", () => {
    const session = {authenticated: false, serverInfo: {user: {id: 1}}};

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
    const session = {authenticated: true, serverInfo: {user: {id: 1}}};

    it("should check if access to a resource is allowed for authenticated users", () => {
      const collection = {permissions: {read: [AUTHENTICATED]}};

      expect(can(session).read(collection)).eql(true);
    });

    it("should check if access to a restricted resource is allowed", () => {
      const collection = {permissions: {read: [1]}};

      expect(can(session).read(collection)).eql(true);
    });

    it("should check if access to a restricted resource is disallowed", () => {
      const collection = {permissions: {read: ["fxa:chucknorris"]}};

      expect(can(session).read(collection)).eql(false);
    });
  });
});

describe("canEditBucket", () => {
  const session = {authenticated: true, serverInfo: {user: {id: 1}}};

  it("should check if a bucket can be edited", () => {
    const bucket = {permissions: {write: [1]}};

    expect(canEditBucket(session, bucket)).eql(true);
  });

  it("should check if a bucket cannot be edited", () => {
    const bucket = {permissions: {write: ["chucknorris"]}};

    expect(canEditBucket(session, bucket)).eql(false);
  });
});

describe("canCreateCollection", () => {
  const session = {authenticated: true, serverInfo: {user: {id: 1}}};

  describe("collection:create permission", () => {
    it("should check if a collection can be created in a bucket", () => {
      const bucket = {permissions: {"collection:create": [1]}};

      expect(canCreateCollection(session, bucket)).eql(true);
    });

    it("should check if a collection cannot be created in a bucket", () => {
      const bucket = {permissions: {"collection:create": ["chucknorris"]}};

      expect(canCreateCollection(session, bucket)).eql(false);
    });
  });

  describe("write permission", () => {
    it("should check if a collection can be created in a bucket", () => {
      const bucket = {permissions: {write: [1]}};

      expect(canCreateCollection(session, bucket)).eql(true);
    });

    it("should check if a collection cannot be created in a bucket", () => {
      const bucket = {permissions: {write: ["chucknorris"]}};

      expect(canCreateCollection(session, bucket)).eql(false);
    });
  });
});

describe("canEditCollection", () => {
  const session = {authenticated: true, serverInfo: {user: {id: 1}}};

  it("should check if a collection can be edited", () => {
    const collection = {permissions: {write: [1]}};

    expect(canEditCollection(session, collection)).eql(true);
  });

  it("should check if a collection cannot be edited", () => {
    const collection = {permissions: {write: ["chucknorris"]}};

    expect(canEditCollection(session, collection)).eql(false);
  });
});

describe("canCreateRecord", () => {
  const session = {authenticated: true, serverInfo: {user: {id: 1}}};

  describe("record:create permission", () => {
    it("should check if a record can be created in a collection", () => {
      const collection = {permissions: {"record:create": [1]}};

      expect(canCreateRecord(session, collection)).eql(true);
    });

    it("should check if a record cannot be created in a collection", () => {
      const collection = {permissions: {"record:create": ["chucknorris"]}};

      expect(canCreateRecord(session, collection)).eql(false);
    });
  });

  describe("write permission", () => {
    it("should check if a record can be created in a collection", () => {
      const collection = {permissions: {write: [1]}};

      expect(canCreateRecord(session, collection)).eql(true);
    });

    it("should check if a record cannot be created in a collection", () => {
      const collection = {permissions: {write: ["chucknorris"]}};

      expect(canCreateRecord(session, collection)).eql(false);
    });
  });
});

describe("canEditRecord", () => {
  const session = {authenticated: true, serverInfo: {user: {id: 1}}};

  it("should check if a record can be edited", () => {
    const record = {permissions: {write: [1]}};

    expect(canEditRecord(session, record)).eql(true);
  });

  it("should check if a record cannot be edited", () => {
    const record = {permissions: {write: ["chucknorris"]}};

    expect(canEditRecord(session, record)).eql(false);
  });
});
