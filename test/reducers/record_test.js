import { expect } from "chai";

import record from "../../scripts/reducers/record";
import {
  RECORD_LOADED,
  RECORD_RESET,
} from "../../scripts/constants";


describe("record reducer", () => {
  it("RECORD_LOADED", () => {
    expect(record(undefined, {
      type: RECORD_LOADED,
      record: {foo: "bar"}
    })).eql({foo: "bar"});
  });

  it("RECORD_RESET", () => {
    expect(record({foo: "bar"}, {type: RECORD_RESET}))
      .eql({});
  });
});
