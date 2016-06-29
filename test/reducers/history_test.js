import { expect } from "chai";

import history from "../../scripts/reducers/history";
import { HISTORY_ADD } from "../../scripts/constants";


describe("history reducer", () => {
  describe("HISTORY_ADD", () => {
    it("should prepend an entry to the stack", () => {
      expect(history(["first"], {type: HISTORY_ADD, entry: "second"}))
        .eql(["second", "first"]);
    });

    it("should not prepend a duplicate entry", () => {
      expect(history(["first"], {type: HISTORY_ADD, entry: "first"}))
        .eql(["first"]);
    });
  });
});
