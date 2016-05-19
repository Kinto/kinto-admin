import { expect } from "chai";

import collection from "../../scripts/reducers/collection";
import {
  CLIENT_BUSY,
  COLLECTION_RESET,
  COLLECTION_PROPERTIES_LOADED,
  COLLECTION_RECORDS_LOADED,
} from "../../scripts/constants";


describe("collection reducer", () => {
  it("CLIENT_BUSY", () => {
    expect(collection(undefined, {type: CLIENT_BUSY, busy: true}))
      .to.have.property("busy").eql(true);
  });

  it("COLLECTION_RESET", () => {
    const initial = collection(undefined, {type: null});
    const altered = collection(initial, {type: CLIENT_BUSY, busy: true});
    expect(collection(altered, {type: COLLECTION_RESET}))
      .eql(initial);
  });

  it("COLLECTION_PROPERTIES_LOADED", () => {
    expect(collection(undefined, {
      type: COLLECTION_PROPERTIES_LOADED,
      properties: {
        bucket: "bucket",
        id: "id",
        label: "bucket/id",
        schema: "schema",
        uiSchema: "uiSchema",
        displayFields: "displayFields",
      },
    })).eql({
      bucket: "bucket",
      name: "id",
      label: "bucket/id",
      schema: "schema",
      uiSchema: "uiSchema",
      displayFields: "displayFields",
      records: [],
      busy: false,
    });
  });

  it("COLLECTION_RECORDS_LOADED", () => {
    expect(collection(undefined, {
      type: COLLECTION_RECORDS_LOADED,
      records: [1, 2, 3]
    }).records).to.have.length.of(3);
  });
});
