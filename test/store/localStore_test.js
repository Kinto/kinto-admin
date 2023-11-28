import * as localStore from "../../src/store/localStore";
import { ANONYMOUS_AUTH } from "../../src/constants";

describe("localStore", () => {
  describe("servers store", () => {
    beforeAll(() => {
      localStore.clearServers();
    });

    it("should load initial servers", () => {
      expect(localStore.loadServers()).toStrictEqual([]);
    });

    it("should load legacy servers", () => {
      const HISTORY_KEY = "kinto-admin-server-history";
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(["someServer", "otherServer"])
      );
      expect(localStore.loadServers()).toStrictEqual([
        { server: "someServer", authType: ANONYMOUS_AUTH },
        { server: "otherServer", authType: ANONYMOUS_AUTH },
      ]);
    });

    it("should save and load servers", () => {
      localStore.saveServers([
        { server: "foo", authType: ANONYMOUS_AUTH },
        { server: "bar", authType: ANONYMOUS_AUTH },
      ]);

      expect(localStore.loadServers()).toStrictEqual([
        { server: "foo", authType: ANONYMOUS_AUTH },
        { server: "bar", authType: ANONYMOUS_AUTH },
      ]);
    });

    it("should clear servers", () => {
      localStore.clearServers();

      expect(localStore.loadServers()).toStrictEqual([]);
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

    beforeAll(() => {
      localStore.clearSession();
    });

    it("should load initial session", () => {
      expect(localStore.loadSession()).toBeNull();
    });

    it("should save and load session with the buckets emptied", () => {
      localStore.saveSession(session);

      expect(localStore.loadSession()).toStrictEqual({
        ...session,
        buckets: [],
      });
    });

    it("should clear session", () => {
      localStore.clearSession();

      expect(localStore.loadSession()).toBeNull();
    });
  });
});
