import { expect } from "chai";
import collections from "../../scripts/reducers/collections";
import * as CollectionsActions from "../../scripts/actions/collections";
import jsonConfig from "../../config/config.json";


describe("collections reducer", () => {
  it("should update collections list", () => {
    expect(collections(undefined, {
      type: CollectionsActions.COLLECTIONS_LIST_RECEIVED,
      collections: jsonConfig.collections
    }))
      .to.include.keys(["tasks"]);
  });

  it("should update sync status for a given collection", () => {
    expect(collections(undefined, {
      type: CollectionsActions.COLLECTION_SYNCED,
      name: "tasks",
      synced: false,
    }).tasks.synced).eql(false);
  });
});
