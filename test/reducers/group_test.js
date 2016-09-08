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
  it("GROUP_BUSY", () => {
    expect(group(undefined, {type: GROUP_BUSY, busy: true}))
      .to.have.property("busy").eql(true);
  });

  it("GROUP_RESET", () => {
    const initial = group(undefined, {type: null});
    const altered = group(initial, {type: GROUP_BUSY, busy: true});
    expect(group(altered, {type: GROUP_RESET}))
      .eql(initial);
  });

  describe("ROUTE_LOAD_REQUEST", () => {
    it("should set the busy flag", () => {
      expect(group({busy: false}, {type: ROUTE_LOAD_REQUEST}))
        .to.have.property("busy").eql(true);
    });
  });

  describe("ROUTE_LOAD_SUCCESS", () => {
    it("should preserve state when no group is passed", () => {
      const initial = group(undefined, {type: null});

      expect(group(undefined, {type: ROUTE_LOAD_SUCCESS}))
        .eql(initial);
    });

    it("should update state when a group is passed", () => {
      const state = group(undefined, {
        type: ROUTE_LOAD_SUCCESS,
        group: {
          data: {id: "grp", last_modified: 42, foo: "bar"},
          permissions: {read: ["a"], write: ["b"]},
        },
      });

      expect(state.id).eql("grp");
      expect(state.data).eql({foo: "bar"});
      expect(state.permissions).eql({read: ["a"], write: ["b"]});
    });
  });

  describe("ROUTE_LOAD_FAILURE", () => {
    it("should clear the busy flag", () => {
      expect(group({busy: true}, {type: ROUTE_LOAD_FAILURE}))
        .to.have.property("busy").eql(false);
    });
  });

  it("GROUP_HISTORY_SUCCESS", () => {
    const history = [1, 2, 3];
    const state = group(undefined, {
      type: GROUP_HISTORY_SUCCESS,
      history
    });

    expect(state.history).eql(history);
    expect(state.historyLoaded).eql(true);
  });
});
