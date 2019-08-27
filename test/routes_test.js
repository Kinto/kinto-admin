import sinon from "sinon";

import { createSandbox } from "./test_utils";

import { onBucketHistoryEnter } from "../src/components/bucket/BucketHistory";
import { onCollectionHistoryEnter } from "../src/components/collection/CollectionHistory";
import { onGroupHistoryEnter } from "../src/components/group/GroupHistory";
import { onRecordHistoryEnter } from "../src/components/record/RecordHistory";

describe("Routes onEnter", () => {
  const params = { bid: "bid", cid: "cid", gid: "gid", rid: "rid" };
  const filters = { since: "12" };
  const props = {
    session: { authenticated: true },
    match: { params },
    location: { search: "?since=12" },
  };
  const store = {
    dispatch() {},
    getState() {},
  };

  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
    sandbox.stub(store, "dispatch");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Buckets history", () => {
    it("should dispatch load history", () => {
      const listBucketHistory = sandbox.spy();
      onBucketHistoryEnter({
        ...props,
        listBucketHistory: listBucketHistory,
      });
      sinon.assert.calledWith(listBucketHistory, "bid");
    });
  });

  describe("Collections history", () => {
    it("should dispatch load history", () => {
      const listCollectionHistory = sandbox.spy();
      onCollectionHistoryEnter({
        ...props,
        listCollectionHistory: listCollectionHistory,
      });
      sinon.assert.calledWith(listCollectionHistory, "bid", "cid", filters);
    });
  });

  describe("Groups history", () => {
    it("should dispatch load history", () => {
      const listGroupHistory = sandbox.spy();
      onGroupHistoryEnter({ ...props, listGroupHistory: listGroupHistory });
      sinon.assert.calledWith(listGroupHistory, "bid", "gid");
    });
  });

  describe("Records history", () => {
    it("should dispatch load history", () => {
      const listRecordHistory = sandbox.spy();
      onRecordHistoryEnter({ ...props, listRecordHistory: listRecordHistory });
      sinon.assert.calledWith(listRecordHistory, "bid", "cid", "rid");
    });
  });
});
