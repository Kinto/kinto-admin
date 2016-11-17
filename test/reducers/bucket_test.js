import { expect } from "chai";

import bucket from "../../src/reducers/bucket";
import {
  BUCKET_BUSY,
  BUCKET_RESET,
  BUCKET_COLLECTIONS_REQUEST,
  BUCKET_COLLECTIONS_SUCCESS,
  BUCKET_HISTORY_REQUEST,
  BUCKET_HISTORY_SUCCESS,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../../src/constants";


describe("bucket reducer", () => {
  describe("BUCKET_BUSY", () => {
    it("should set the busy flag", () => {
      expect(bucket(undefined, {type: BUCKET_BUSY, busy: true}))
        .to.have.property("busy").eql(true);
    });
  });

  describe("BUCKET_RESET", () => {
    it("should reset the state to its initial value", () => {
      const initial = bucket(undefined, {type: null});
      const altered = bucket(initial, {type: BUCKET_BUSY, busy: true});
      expect(bucket(altered, {type: BUCKET_RESET}))
        .eql(initial);
    });
  });

  describe("ROUTE_LOAD_REQUEST", () => {
    it("should set the busy flag", () => {
      expect(bucket({busy: false}, {type: ROUTE_LOAD_REQUEST}))
        .to.have.property("busy").eql(true);
    });
  });

  describe("ROUTE_LOAD_SUCCESS", () => {
    it("should preserve state when no bucket is passed", () => {
      const initial = bucket(undefined, {type: null});

      expect(bucket(undefined, {type: ROUTE_LOAD_SUCCESS}))
        .eql(initial);
    });

    it("should update state when a bucket is passed", () => {
      const state = bucket(undefined, {
        type: ROUTE_LOAD_SUCCESS,
        bucket: {
          data: {id: "buck", last_modified: 42, foo: "bar"},
          permissions: {read: ["a"], write: ["b"]},
        },
      });

      expect(state.data).eql({id: "buck", foo: "bar", last_modified: 42});
      expect(state.permissions).eql({read: ["a"], write: ["b"]});
    });
  });

  describe("ROUTE_LOAD_FAILURE", () => {
    it("should clear the busy flag", () => {
      expect(bucket({busy: true}, {type: ROUTE_LOAD_FAILURE}))
        .to.have.property("busy").eql(false);
    });
  });

  describe("BUCKET_COLLECTIONS_REQUEST", () => {
    it("should update the collectionsLoaded flag", () => {
      const state = {collectionsLoaded: true};
      const action = {type: BUCKET_COLLECTIONS_REQUEST};

      expect(bucket(state, action))
        .to.have.property("collectionsLoaded").eql(false);
    });
  });

  describe("BUCKET_COLLECTIONS_SUCCESS", () => {
    const state = {
      collections: [],
      collectionsLoaded: false,
    };
    const action = {
      type: BUCKET_COLLECTIONS_SUCCESS,
      collections: [1, 2, 3],
    };

    it("should update the list of bucket collections", () => {
      expect(bucket(state, action))
        .to.have.property("collections").eql(action.collections);
    });

    it("should update the collectionsLoaded flag", () => {
      expect(bucket(state, action))
        .to.have.property("collectionsLoaded").eql(true);
    });
  });

  describe("BUCKET_HISTORY_REQUEST", () => {
    it("should update the historyLoaded flag", () => {
      const state = {historyLoaded: true};
      const action = {type: BUCKET_HISTORY_REQUEST};

      expect(bucket(state, action))
        .to.have.property("historyLoaded").eql(false);
    });
  });

  describe("BUCKET_HISTORY_SUCCESS", () => {
    const state = {
      history: [],
      historyLoaded: false,
    };
    const action = {
      type: BUCKET_HISTORY_SUCCESS,
      history: [1, 2, 3],
    };

    it("should update the list of history", () => {
      expect(bucket(state, action))
        .to.have.property("history").eql(action.history);
    });

    it("should update the historyLoaded flag", () => {
      expect(bucket(state, action))
        .to.have.property("historyLoaded").eql(true);
    });
  });
});
