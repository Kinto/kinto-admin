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
      credentials: {
        username: "user",
        password: "pass",
      },
      buckets: [{}],
    };

    before(() => {
      localStore.clearSession();
    });

    it("should load initial session", () => {
      expect(localStore.loadSession()).eql(null);
    });

    it("should save and load session with the buckets emptied", () => {
      localStore.saveSession(session);

      expect(localStore.loadSession()).eql({ ...session, buckets: [] });
    });

    it("should clear session", () => {
      localStore.clearSession();

      expect(localStore.loadSession()).eql(null);
    });
  });
});
