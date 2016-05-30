import { expect } from "chai";

import collection from "../../scripts/reducers/collection";
import {
  COLLECTION_BUSY,
  COLLECTION_RESET,
  COLLECTION_LOAD_SUCCESS,
  COLLECTION_RECORDS_SUCCESS,
} from "../../scripts/constants";


describe("collection reducer", () => {
  it("COLLECTION_BUSY", () => {
    expect(collection(undefined, {type: COLLECTION_BUSY, busy: true}))
      .to.have.property("busy").eql(true);
  });

  it("COLLECTION_RESET", () => {
    const initial = collection(undefined, {type: null});
    const altered = collection(initial, {type: COLLECTION_BUSY, busy: true});
    expect(collection(altered, {type: COLLECTION_RESET}))
      .eql(initial);
  });

  it("COLLECTION_LOAD_SUCCESS", () => {
    expect(collection(undefined, {
      type: COLLECTION_LOAD_SUCCESS,
      data: {
        bucket: "bucket",
        id: "id",
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

  it("COLLECTION_RECORDS_SUCCESS", () => {
    expect(collection(undefined, {
      type: COLLECTION_RECORDS_SUCCESS,
      records: [1, 2, 3]
    }).records).to.have.length.of(3);
  });
});
