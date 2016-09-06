import { expect } from "chai";

import * as localStore from "../../src/store/localStore";


describe("localStore", () => {
  describe("history store", () => {
    before(() => {
      localStore.clearHistory();
    });

    it("should load initial history", () => {
      expect(localStore.loadHistory()).eql([]);
    });

    it("should save and load history", () => {
      localStore.saveHistory(["foo", "bar"]);

      expect(localStore.loadHistory()).eql(["foo", "bar"]);
    });

    it("should clear history", () => {
      localStore.clearHistory();

      expect(localStore.loadHistory()).eql([]);
    });
  });

  describe("session store", () => {
    const session = {
      server: "http://server.test/v1",
      username: "user",
      password: "pass",
    };

    before(() => {
      localStore.clearSession();
    });

    it("should load initial session", () => {
      expect(localStore.loadSession()).eql(null);
    });

    it("should save and load session", () => {
      localStore.saveSession(session);

      expect(localStore.loadSession()).eql(session);
    });

    it("should clear session", () => {
      localStore.clearSession();

      expect(localStore.loadSession()).eql(null);
    });
  });
});
