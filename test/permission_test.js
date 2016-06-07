import { expect } from "chai";

import { EVERYONE, AUTHENTICATED, can } from "../scripts/permission";


describe("permission", () => {
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
