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

  beforeEach(() => {
    jest.spyOn(store, "dispatch");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Buckets history", () => {
    it("should dispatch load history", () => {
      const listBucketHistory = jest.fn();
      onBucketHistoryEnter({
        ...props,
        listBucketHistory: listBucketHistory,
      });
      expect(listBucketHistory).toHaveBeenCalledWith(
        "bid",
        expect.objectContaining({ since: expect.stringMatching(/./) })
      );
    });
  });

  describe("Collections history", () => {
    it("should dispatch load history", () => {
      const listCollectionHistory = jest.fn();
      onCollectionHistoryEnter({
        ...props,
        listCollectionHistory: listCollectionHistory,
      });
      expect(listCollectionHistory).toHaveBeenCalledWith("bid", "cid", filters);
    });
  });

  describe("Groups history", () => {
    it("should dispatch load history", () => {
      const listGroupHistory = jest.fn();
      onGroupHistoryEnter({ ...props, listGroupHistory: listGroupHistory });
      expect(listGroupHistory).toHaveBeenCalledWith("bid", "gid");
    });
  });

  describe("Records history", () => {
    it("should dispatch load history", () => {
      const listRecordHistory = jest.fn();
      onRecordHistoryEnter({ ...props, listRecordHistory: listRecordHistory });
      expect(listRecordHistory).toHaveBeenCalledWith("bid", "cid", "rid");
    });
  });
});
