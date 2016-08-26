import { expect } from "chai";

import group from "../../scripts/reducers/group";
import {
  GROUP_BUSY,
  GROUP_RESET,
  GROUP_LOAD_SUCCESS,
  GROUP_HISTORY_SUCCESS,
} from "../../scripts/constants";


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

  it("GROUP_LOAD_SUCCESS", () => {
    expect(group(undefined, {
      type: GROUP_LOAD_SUCCESS,
      data: {
        id: "id",
        members: ["blanca"]
      },
      permissions: {write: [], read: []},
    })).eql({
      id: "id",
      busy: false,
      members: ["blanca"],
      data: {},
      permissions: {write: [], read: []},
      history: [],
      historyLoaded: false,
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
