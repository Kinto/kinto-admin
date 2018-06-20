import { expect } from "chai";

import history from "../../src/reducers/history";
import { HISTORY_ADD, HISTORY_CLEAR } from "../../src/constants";
import { ANONYMOUS_AUTH } from "../../src/components/AuthForm";

describe("history reducer", () => {
  describe("HISTORY_ADD", () => {
    it("should prepend an entry to the stack", () => {
      expect(
        history([{ server: "first", authType: ANONYMOUS_AUTH }], {
          type: HISTORY_ADD,
          server: "second",
          authType: ANONYMOUS_AUTH,
        })
      ).eql([
        { server: "second", authType: ANONYMOUS_AUTH },
        { server: "first", authType: ANONYMOUS_AUTH },
      ]);
    });

    it("should not prepend a duplicate entry", () => {
      expect(
        history([{ server: "first", authType: ANONYMOUS_AUTH }], {
          type: HISTORY_ADD,
          server: "first",
          authType: ANONYMOUS_AUTH,
        })
      ).eql([{ server: "first", authType: ANONYMOUS_AUTH }]);
    });
  });

  describe("HISTORY_CLEAR", () => {
    it("should clear the stack", () => {
      expect(
        history(
          [
            { server: "first", authType: ANONYMOUS_AUTH },
            { server: "second", authType: ANONYMOUS_AUTH },
          ],
          { type: HISTORY_CLEAR }
        )
      ).eql([]);
    });
  });
});
