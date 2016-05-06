import { expect } from "chai";
import reducer from "../../scripts/reducers/conflicts";
import * as actions from "../../scripts/actions/conflicts";

describe("conflicts reducer", () => {
  it("should list no conflicts by default", () => {
    expect(reducer(undefined, {type: null})).eql({});
  });

  it("should replace state with new reported conflicts", () => {
    const previous = {
      id1: {type: "incoming", local: {id: "id1"}, remote: {id: "id1"}}
    };
    const reported = [
      {type: "incoming", local: {id: "id2"}, remote: {id: "id2"}},
      {type: "incoming", local: {id: "id3"}, remote: {id: "id3"}},
    ];

    expect(reducer(previous, {
      type: actions.CONFLICTS_REPORTED,
      conflicts: reported
    })).eql({
      id2: reported[0],
      id3: reported[1],
    });
  });

  it("should mark a conflict as resolved", () => {
    const previous = {
      id1: {type: "incoming", local: {id: "id1"}, remote: {id: "id1"}},
      id2: {type: "incoming", local: {id: "id2"}, remote: {id: "id2"}},
    };

    expect(reducer(previous, {
      type: actions.CONFLICT_RESOLVED,
      id: "id1"
    })).eql({
      id2: previous.id2
    });
  });
});
