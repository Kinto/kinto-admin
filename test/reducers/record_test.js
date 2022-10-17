import { expect } from "chai";

import record from "../../src/reducers/record";
import {
  RECORD_BUSY,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_RESET,
  RECORD_HISTORY_REQUEST,
  RECORD_HISTORY_SUCCESS,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../../src/constants";

describe("record reducer", () => {
  describe("busy flag", () => {
    it("RECORD_BUSY", () => {
      expect(record({ busy: false }, { type: RECORD_BUSY, busy: true }))
        .to.have.property("busy")
        .eql(true);
    });

    it("ROUTE_LOAD_REQUEST", () => {
      expect(record({ busy: false }, { type: ROUTE_LOAD_REQUEST }))
        .to.have.property("busy")
        .eql(true);
    });

    it("RECORD_CREATE_REQUEST", () => {
      expect(record({ busy: false }, { type: RECORD_CREATE_REQUEST }))
        .to.have.property("busy")
        .eql(true);
    });

    it("RECORD_UPDATE_REQUEST", () => {
      expect(record({ busy: false }, { type: RECORD_UPDATE_REQUEST }))
        .to.have.property("busy")
        .eql(true);
    });

    it("RECORD_DELETE_REQUEST", () => {
      expect(record({ busy: false }, { type: RECORD_DELETE_REQUEST }))
        .to.have.property("busy")
        .eql(true);
    });
  });

  describe("ROUTE_LOAD_SUCCESS", () => {
    it("should preserve state when no record is passed", () => {
      const initial = record(undefined, { type: null });

      expect(record(undefined, { type: ROUTE_LOAD_SUCCESS })).eql(initial);
    });

    it("should update state when a record is passed", () => {
      const state = record(undefined, {
        type: ROUTE_LOAD_SUCCESS,
        record: {
          data: { id: "uuid", last_modified: 42, foo: "bar" },
          permissions: { read: ["a"], write: ["b"] },
        },
      });

      expect(state.data).eql({ id: "uuid", foo: "bar", last_modified: 42 });
      expect(state.permissions).eql({ read: ["a"], write: ["b"] });
    });
  });

  describe("ROUTE_LOAD_FAILURE", () => {
    it("should clear the busy flag", () => {
      expect(record({ busy: true }, { type: ROUTE_LOAD_FAILURE }))
        .to.have.property("busy")
        .eql(false);
    });
  });

  describe("RECORD_RESET", () => {
    it("should reset record to initial state", () => {
      const initial = record(undefined, { type: "@@INIT" });
      expect(
        record(
          {
            busy: true,
            data: { foo: "bar" },
            permissions: {
              write: [1],
              read: [2],
            },
            history: [1, 2],
            historyLoaded: true,
          },
          { type: RECORD_RESET }
        )
      ).eql(initial);
    });
  });

  describe("RECORD_HISTORY_REQUEST", () => {
    it("should update record history state", () => {
      const state = record(undefined, {
        type: RECORD_HISTORY_REQUEST,
      });
      expect(state.history.loaded).eql(false);
    });
  });

  describe("RECORD_HISTORY_SUCCESS", () => {
    it("should update record history state", () => {
      const fakeNext = () => {};
      const initial = {
        history: {
          entries: [],
          loaded: false,
          hasNextPage: true,
          next: fakeNext,
        },
      };
      const action = {
        type: RECORD_HISTORY_SUCCESS,
        entries: [1, 2, 3],
        hasNextPage: true,
        next: fakeNext,
      };

      const state = record(initial, action);

      expect(state.history.entries).eql([1, 2, 3]);
      expect(state.history.loaded).eql(true);
      expect(state.history.hasNextPage).eql(true);
      expect(state.history.next).eql(fakeNext);
    });
  });
});
