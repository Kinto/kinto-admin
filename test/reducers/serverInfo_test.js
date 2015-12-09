import { expect } from "chai";
import serverInfo from "../../scripts/reducers/serverInfo";
import * as actions from "../../scripts/actions/serverInfo";

describe("serverInfo reducer", () => {
  it("should update state with loaded server info", () => {
    expect(serverInfo({a: 1}, {
      type: actions.SERVERINFO_LOADED,
      serverInfo: {b: 2},
    })).eql({a: 1, b: 2});
  });

  it("should reset state", () => {
    expect(serverInfo({a: 1}, {
      type: actions.SERVERINFO_RESET,
    })).eql({});
  });
});
