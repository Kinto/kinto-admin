import sinon from "sinon";

import * as bucketActions from "../src/actions/bucket";
import * as collectionActions from "../src/actions/collection";
import * as groupActions from "../src/actions/group";
import * as recordActions from "../src/actions/record";
import {
  onBucketHistoryEnter,
  onCollectionHistoryEnter,
  onGroupHistoryEnter,
  onRecordHistoryEnter,
} from "../src/routes";

describe("Routes onEnter", () => {
  const params = { bid: "bid", cid: "cid", gid: "gid", rid: "rid" };
  const filters = { since: "12" };
  const state = {
    session: { authenticated: true },
    routing: { locationBeforeTransitions: { query: filters } },
  };
  const store = {
    dispatch() {},
    getState() {
      return state;
    },
  };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(store, "dispatch");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Buckets history", () => {
    it("should dispatch load history", () => {
      onBucketHistoryEnter(store, { params });
      const action = bucketActions.listBucketHistory("bid", filters);
      sinon.assert.calledWith(store.dispatch, action);
    });
  });

  describe("Collections history", () => {
    it("should dispatch load history", () => {
      onCollectionHistoryEnter(store, { params });
      const action = collectionActions.listCollectionHistory(
        "bid",
        "cid",
        filters
      );
      sinon.assert.calledWith(store.dispatch, action);
    });
  });

  describe("Groups history", () => {
    it("should dispatch load history", () => {
      onGroupHistoryEnter(store, { params });
      const action = groupActions.listGroupHistory("bid", "gid", filters);
      sinon.assert.calledWith(store.dispatch, action);
    });
  });

  describe("Records history", () => {
    it("should dispatch load history", () => {
      onRecordHistoryEnter(store, { params });
      const action = recordActions.listRecordHistory(
        "bid",
        "cid",
        "rid",
        filters
      );
      sinon.assert.calledWith(store.dispatch, action);
    });
  });
});
