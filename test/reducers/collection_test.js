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
        attachment: {enabled: true, required: false},
        displayFields: "displayFields",
      },
    })).eql({
      bucket: "bucket",
      name: "id",
      label: "bucket/id",
      schema: "schema",
      uiSchema: "uiSchema",
      attachment: {enabled: true, required: false},
      displayFields: "displayFields",
      records: [],
      recordsLoaded: false,
      busy: false,
    });
  });

  it("COLLECTION_RECORDS_SUCCESS", () => {
    const records = [1, 2, 3];
    const state = collection(undefined, {
      type: COLLECTION_RECORDS_SUCCESS,
      records
    });

    expect(state.records).eql(records);
    expect(state.recordsLoaded).eql(true);
  });
});
