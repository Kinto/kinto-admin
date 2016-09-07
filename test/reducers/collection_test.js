import { expect } from "chai";

import collection from "../../src/reducers/collection";
import {
  COLLECTION_BUSY,
  COLLECTION_RESET,
  COLLECTION_LOAD_SUCCESS,
  COLLECTION_RECORDS_REQUEST,
  COLLECTION_RECORDS_SUCCESS,
  COLLECTION_HISTORY_SUCCESS,
} from "../../src/constants";


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

  describe("COLLECTION_RECORDS_REQUEST", () => {
    it("should update the recordsLoaded flag", () => {
      expect(collection({data: {}, recordsLoaded: true}, {
        type: COLLECTION_RECORDS_REQUEST,
      })).to.have.property("recordsLoaded").eql(false);
    });

    it("should update the sort parameter", () => {
      expect(collection(undefined, {
        type: COLLECTION_RECORDS_REQUEST,
        sort: "title",
      })).to.have.property("sort").eql("title");
    });

    it("should reset records list when the sort param changes", () => {
      expect(collection({
        data: {sort: "initial"},
        records: [1, 2, 3],
      }, {
        type: COLLECTION_RECORDS_REQUEST,
        sort: "title",
      })).to.have.property("records").eql([]);
    });
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
      busy: false,
      data: {
        id: "id",
        bucket: "bucket",
        schema: "schema",
        uiSchema: "uiSchema",
        attachment: {enabled: true, required: false},
        displayFields: "displayFields",
        sort: "-last_modified",
      },
      permissions: {write: [], read: []},
      records: [],
      recordsLoaded: false,
      hasNextRecords: false,
      listNextRecords: null,
      history: [],
      historyLoaded: false,
    });
  });

  describe("COLLECTION_RECORDS_SUCCESS", () => {
    const records = [1, 2, 3];

    let state;

    beforeEach(() => {
      state = collection(undefined, {
        type: COLLECTION_RECORDS_SUCCESS,
        records
      });
    });

    it("should assign received records to state", () => {
      expect(state.records).eql(records);
    });

    it("should mark records as loaded", () => {
      expect(state.recordsLoaded).eql(true);
    });

    it("should append new records received to existing list", () => {
      const state2 = collection(state, {
        type: COLLECTION_RECORDS_SUCCESS,
        records: [4, 5],
      });

      expect(state2.records).eql([1, 2, 3, 4, 5]);
    });
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
