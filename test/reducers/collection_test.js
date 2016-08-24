import { expect } from "chai";

import collection from "../../scripts/reducers/collection";
import {
  COLLECTION_BUSY,
  COLLECTION_RESET,
  COLLECTION_LOAD_SUCCESS,
  COLLECTION_RECORDS_REQUEST,
  COLLECTION_RECORDS_SUCCESS,
  COLLECTION_HISTORY_SUCCESS,
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

  it("COLLECTION_RECORDS_REQUEST", () => {
    expect(collection(undefined, {
      type: COLLECTION_RECORDS_REQUEST,
      sort: "title",
    })).to.have.property("sort").eql("title");
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
      permissions: {write: [], read: []},
    })).eql({
      bucket: "bucket",
      name: "id",
      schema: "schema",
      uiSchema: "uiSchema",
      attachment: {enabled: true, required: false},
      displayFields: "displayFields",
      records: [],
      recordsLoaded: false,
      sort: "-last_modified",
      busy: false,
      permissions: {write: [], read: []},
      history: [],
      historyLoaded: false,
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

  it("COLLECTION_HISTORY_SUCCESS", () => {
    const history = [1, 2, 3];
    const state = collection(undefined, {
      type: COLLECTION_HISTORY_SUCCESS,
      history
    });

    expect(state.history).eql(history);
    expect(state.historyLoaded).eql(true);
  });
});
