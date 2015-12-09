import { expect } from "chai";
import collections from "../../scripts/reducers/collections";
import { COLLECTION_SYNCED } from "../../scripts/actions/collection";

describe("collections reducer", () => {
  it("should have static state defined", () => {
    expect(collections(undefined, {type: null}))
      .to.include.keys(["addons", "certificates", "gfx", "plugins"]);
  });

  it("should update sync status for a given collection", () => {
    expect(collections(undefined, {
      type: COLLECTION_SYNCED,
      name: "plugins",
      synced: false,
    }).plugins.synced).eql(false);
  });
});
