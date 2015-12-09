import { expect } from "chai";
import collection from "../../scripts/reducers/collection";
import * as actions from "../../scripts/actions/collection";

describe("collection reducer", () => {
  it("should update state when collection is ready", () => {
    expect(collection(undefined, {
      type: actions.COLLECTION_READY,
      name: "test.name",
      schema: "test.schema",
      config: "test.config",
    })).eql({
      name: "test.name",
      schema: "test.schema",
      config: "test.config",
      message: null,
      busy: false,
      records: [],
    });
  });

  it("should update state when collection is busy", () => {
    expect(collection(undefined, {
      type: actions.COLLECTION_BUSY,
      flag: true,
    })).to.have.property("busy").eql(true);
  });

  it("should update state when collection is loaded", () => {
    expect(collection(undefined, {
      type: actions.COLLECTION_LOADED,
      records: [1, 2, 3]
    }).records).to.have.length.of(3);
  });
});
