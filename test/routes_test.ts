import { onBucketHistoryEnter } from "@src/components/bucket/BucketHistory";
import { onCollectionHistoryEnter } from "@src/components/collection/CollectionHistory";

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
    vi.spyOn(store, "dispatch");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Buckets history", () => {
    it("should dispatch load history", () => {
      const listBucketHistory = vi.fn();
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
      const listCollectionHistory = vi.fn();
      onCollectionHistoryEnter({
        ...props,
        listCollectionHistory: listCollectionHistory,
      });
      expect(listCollectionHistory).toHaveBeenCalledWith("bid", "cid", filters);
    });
  });
});
