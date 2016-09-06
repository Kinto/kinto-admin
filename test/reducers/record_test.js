import { expect } from "chai";

import record from "../../src/reducers/record";
import {
  RECORD_LOAD_SUCCESS,
  RECORD_RESET,
} from "../../src/constants";


describe("record reducer", () => {
  it("RECORD_LOAD_SUCCESS", () => {
    expect(record(undefined, {
      type: RECORD_LOAD_SUCCESS,
      data: {foo: "bar"},
      permissions: {
        write: [1],
        read: [2],
      }
    })).eql({
      data: {foo: "bar"},
      permissions: {
        write: [1],
        read: [2],
      }
    });
  });

  it("RECORD_RESET", () => {
    expect(record({
      data: {foo: "bar"},
      permissions: {
        write: [1],
        read: [2],
      }
    }, {type: RECORD_RESET}))
      .eql({
        data: {},
        permissions: {
          write: [],
          read: [],
        }
      });
  });
});
