import { expect } from "chai";

import history from "../../src/reducers/history";
import { HISTORY_ADD, HISTORY_CLEAR } from "../../src/constants";

describe("history reducer", () => {
  describe("HISTORY_ADD", () => {
    it("should prepend an entry to the stack", () => {
      expect(history(["first"], { type: HISTORY_ADD, entry: "second" })).eql([
        "second",
        "first",
      ]);
    });

    it("should not prepend a duplicate entry", () => {
      expect(history(["first"], { type: HISTORY_ADD, entry: "first" })).eql([
        "first",
      ]);
    });
  });

  describe("HISTORY_CLEAR", () => {
    it("should clear the stack", () => {
      expect(history(["first", "second"], { type: HISTORY_CLEAR })).eql([]);
    });
  });
});
