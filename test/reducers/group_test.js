import { expect } from "chai";

import group from "../../src/reducers/group";
import {
  GROUP_BUSY,
  GROUP_RESET,
  GROUP_HISTORY_SUCCESS,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../../src/constants";

describe("group reducer", () => {
  describe("GROUP_BUSY", () => {
    it("should update the busy flag", () => {
      expect(group(undefined, { type: GROUP_BUSY, busy: true }))
        .to.have.property("busy")
        .eql(true);
    });
  });

  describe("GROUP_RESET", () => {
    it("should reset group state", () => {
      const initial = group(undefined, { type: null });
      const altered = group(initial, { type: GROUP_BUSY, busy: true });
      expect(group(altered, { type: GROUP_RESET })).eql(initial);
    });
  });

  describe("ROUTE_LOAD_REQUEST", () => {
    it("should set the busy flag", () => {
      expect(group({ busy: false }, { type: ROUTE_LOAD_REQUEST }))
        .to.have.property("busy")
        .eql(true);
    });
  });

  describe("ROUTE_LOAD_SUCCESS", () => {
    it("should preserve state when no group is passed", () => {
      const initial = group(undefined, { type: null });

      expect(group(undefined, { type: ROUTE_LOAD_SUCCESS })).eql(initial);
    });

    it("should update state when a group is passed", () => {
      const state = group(undefined, {
        type: ROUTE_LOAD_SUCCESS,
        group: {
          data: { id: "grp", last_modified: 42, foo: "bar" },
          permissions: { read: ["a"], write: ["b"] },
        },
      });

      expect(state.data).eql({ id: "grp", foo: "bar", last_modified: 42 });
      expect(state.permissions).eql({ read: ["a"], write: ["b"] });
    });
  });

  describe("ROUTE_LOAD_FAILURE", () => {
    it("should clear the busy flag", () => {
      expect(group({ busy: true }, { type: ROUTE_LOAD_FAILURE }))
        .to.have.property("busy")
        .eql(false);
    });
  });

  describe("GROUP_HISTORY_SUCCESS", () => {
    it("should update group history state", () => {
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
        type: GROUP_HISTORY_SUCCESS,
        entries: [1, 2, 3],
        hasNextPage: true,
        next: fakeNext,
      };

      const state = group(initial, action);

      expect(state.history.entries).eql([1, 2, 3]);
      expect(state.history.loaded).eql(true);
      expect(state.history.hasNextPage).eql(true);
      expect(state.history.next).eql(fakeNext);
    });
  });
});
