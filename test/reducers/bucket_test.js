import { expect } from "chai";

import bucket from "../../src/reducers/bucket";
import {
  BUCKET_BUSY,
  BUCKET_RESET,
  BUCKET_COLLECTIONS_REQUEST,
  BUCKET_COLLECTIONS_SUCCESS,
  BUCKET_HISTORY_REQUEST,
  BUCKET_HISTORY_NEXT_REQUEST,
  BUCKET_HISTORY_SUCCESS,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../../src/constants";

describe("bucket reducer", () => {
  describe("BUCKET_BUSY", () => {
    it("should set the busy flag", () => {
      expect(bucket(undefined, { type: BUCKET_BUSY, busy: true }))
        .to.have.property("busy")
        .eql(true);
    });
  });

  describe("BUCKET_RESET", () => {
    it("should reset the state to its initial value", () => {
      const initial = bucket(undefined, { type: null });
      const altered = bucket(initial, { type: BUCKET_BUSY, busy: true });
      expect(bucket(altered, { type: BUCKET_RESET })).eql(initial);
    });
  });

  describe("ROUTE_LOAD_REQUEST", () => {
    it("should set the busy flag", () => {
      expect(bucket({ busy: false }, { type: ROUTE_LOAD_REQUEST }))
        .to.have.property("busy")
        .eql(true);
    });
  });

  describe("ROUTE_LOAD_SUCCESS", () => {
    it("should preserve state when no bucket is passed", () => {
      const initial = bucket(undefined, { type: null });

      expect(bucket(undefined, { type: ROUTE_LOAD_SUCCESS })).eql(initial);
    });

    it("should preserve state when no groups are passed", () => {
      expect(
        bucket(
          { groups: [{ id: "g1" }] },
          { type: ROUTE_LOAD_SUCCESS, bucket: {} }
        )
      )
        .to.have.property("groups")
        .eql([{ id: "g1" }]);
    });

    it("should update state when a bucket is passed", () => {
      const state = bucket(undefined, {
        type: ROUTE_LOAD_SUCCESS,
        bucket: {
          data: { id: "buck", last_modified: 42, foo: "bar" },
          permissions: { read: ["a"], write: ["b"] },
        },
      });

      expect(state.data).eql({ id: "buck", foo: "bar", last_modified: 42 });
      expect(state.permissions).eql({ read: ["a"], write: ["b"] });
    });
  });

  describe("ROUTE_LOAD_FAILURE", () => {
    it("should clear the busy flag", () => {
      expect(bucket({ busy: true }, { type: ROUTE_LOAD_FAILURE }))
        .to.have.property("busy")
        .eql(false);
    });
  });

  describe("BUCKET_COLLECTIONS_REQUEST", () => {
    it("should update the collectionsLoaded flag", () => {
      const state = { collections: { loaded: true } };
      const action = { type: BUCKET_COLLECTIONS_REQUEST };

      expect(bucket(state, action))
        .to.have.property("collections")
        .to.have.property("loaded")
        .eql(false);
    });
  });

  describe("BUCKET_COLLECTIONS_SUCCESS", () => {
    const state = {
      collections: {
        loaded: false,
        entries: [],
      },
    };
    const action = {
      type: BUCKET_COLLECTIONS_SUCCESS,
      entries: [1, 2, 3],
    };

    it("should update the list of bucket collections", () => {
      expect(bucket(state, action))
        .to.have.property("collections")
        .to.have.property("entries")
        .eql(action.entries);
    });

    it("should update the collectionsLoaded flag", () => {
      expect(bucket(state, action))
        .to.have.property("collections")
        .to.have.property("loaded")
        .eql(true);
    });
  });

  describe("BUCKET_HISTORY_REQUEST", () => {
    it("should update the history loaded flag", () => {
      const state = { historyLoaded: true };
      const action = { type: BUCKET_HISTORY_REQUEST };

      expect(bucket(state, action))
        .to.have.property("history")
        .to.have.property("loaded")
        .eql(false);
    });
  });

  describe("BUCKET_HISTORY_NEXT_REQUEST", () => {
    it("should update the history loaded flag", () => {
      const state = { historyLoaded: true };
      const action = { type: BUCKET_HISTORY_NEXT_REQUEST };

      expect(bucket(state, action))
        .to.have.property("history")
        .to.have.property("loaded")
        .eql(false);
    });
  });

  describe("BUCKET_HISTORY_SUCCESS", () => {
    const state = {
      history: {
        entries: [],
        loaded: false,
        hasNextPage: true,
        next: fakeNext,
      },
    };
    const fakeNext = () => {};
    const action = {
      type: BUCKET_HISTORY_SUCCESS,
      entries: [1, 2, 3],
      hasNextPage: true,
      next: fakeNext,
    };

    it("should update the list of history", () => {
      expect(bucket(state, action))
        .to.have.property("history")
        .to.have.property("entries")
        .eql(action.entries);
    });

    it("should update the historyLoaded flag", () => {
      expect(bucket(state, action))
        .to.have.property("history")
        .to.have.property("loaded")
        .eql(true);
    });

    it("should update the hasNextHistory flag", () => {
      expect(bucket(state, action))
        .to.have.property("history")
        .to.have.property("hasNextPage")
        .eql(true);
    });

    it("should update the listNextHistory flag", () => {
      expect(bucket(state, action))
        .to.have.property("history")
        .to.have.property("next")
        .eql(fakeNext);
    });
  });
});
