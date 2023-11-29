import servers from "../../src/reducers/servers";
import { SERVERS_ADD, SERVERS_CLEAR } from "../../src/constants";
import { ANONYMOUS_AUTH } from "../../src/constants";

describe("server reducer", () => {
  describe("SERVERS_ADD", () => {
    it("should prepend an entry to the stack", () => {
      expect(
        servers([{ server: "first", authType: ANONYMOUS_AUTH }], {
          type: SERVERS_ADD,
          server: "second",
          authType: ANONYMOUS_AUTH,
        })
      ).toStrictEqual([
        { server: "second", authType: ANONYMOUS_AUTH },
        { server: "first", authType: ANONYMOUS_AUTH },
      ]);
    });

    it("should not prepend a duplicate entry", () => {
      expect(
        servers([{ server: "first", authType: ANONYMOUS_AUTH }], {
          type: SERVERS_ADD,
          server: "first",
          authType: ANONYMOUS_AUTH,
        })
      ).toStrictEqual([{ server: "first", authType: ANONYMOUS_AUTH }]);
    });
  });

  describe("SERVERS_CLEAR", () => {
    it("should clear the stack", () => {
      expect(
        servers(
          [
            { server: "first", authType: ANONYMOUS_AUTH },
            { server: "second", authType: ANONYMOUS_AUTH },
          ],
          { type: SERVERS_CLEAR }
        )
      ).toStrictEqual([]);
    });
  });
});
