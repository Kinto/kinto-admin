import { expect } from "chai";

import record from "../../src/reducers/record";
import {
  RECORD_RESET,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../../src/constants";


describe("record reducer", () => {
  describe("ROUTE_LOAD_REQUEST", () => {
    it("should set the busy flag", () => {
      expect(record({busy: false}, {type: ROUTE_LOAD_REQUEST}))
        .to.have.property("busy").eql(true);
    });
  });

  describe("ROUTE_LOAD_SUCCESS", () => {
    it("should preserve state when no record is passed", () => {
      const initial = record(undefined, {type: null});

      expect(record(undefined, {type: ROUTE_LOAD_SUCCESS}))
        .eql(initial);
    });

    it("should update state when a record is passed", () => {
      const state = record(undefined, {
        type: ROUTE_LOAD_SUCCESS,
        record: {
          data: {id: "uuid", last_modified: 42, foo: "bar"},
          permissions: {read: ["a"], write: ["b"]},
        },
      });

      expect(state.data).eql({id: "uuid", foo: "bar", last_modified: 42});
      expect(state.permissions).eql({read: ["a"], write: ["b"]});
    });
  });

  describe("ROUTE_LOAD_FAILURE", () => {
    it("should clear the busy flag", () => {
      expect(record({busy: true}, {type: ROUTE_LOAD_FAILURE}))
        .to.have.property("busy").eql(false);
    });
  });

  describe("RECORD_RESET", () => {
    it("should reset record to initial state", () => {
      expect(record({
        busy: true,
        data: {foo: "bar"},
        permissions: {
          write: [1],
          read: [2],
        }
      }, {type: RECORD_RESET}))
        .eql({
          busy: false,
          data: {},
          permissions: {
            write: [],
            read: [],
          }
        });
    });
  });
});
