import { expect } from "chai";

import * as localStore from "../../src/store/localStore";
import { ANONYMOUS_AUTH } from "../../src/constants";

describe("localStore", () => {
  describe("history store", () => {
    before(() => {
      localStore.clearHistory();
    });

    it("should load initial history", () => {
      expect(localStore.loadHistory()).eql([]);
    });

    it("should load legacy history", () => {
      const HISTORY_KEY = "kinto-admin-server-history";
      sessionStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(["someServer", "otherServer"])
      );
      expect(localStore.loadHistory()).eql([
        { server: "someServer", authType: ANONYMOUS_AUTH },
        { server: "otherServer", authType: ANONYMOUS_AUTH },
      ]);
    });

    it("should save and load history", () => {
      localStore.saveHistory([
        { server: "foo", authType: ANONYMOUS_AUTH },
        { server: "bar", authType: ANONYMOUS_AUTH },
      ]);

      expect(localStore.loadHistory()).eql([
        { server: "foo", authType: ANONYMOUS_AUTH },
        { server: "bar", authType: ANONYMOUS_AUTH },
      ]);
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
