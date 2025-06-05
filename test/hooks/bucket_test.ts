import * as client from "@src/client";
import {
  expandBucketsCollections,
  useBucket,
  useBucketHistory,
  useBucketList,
  useBucketPermissions,
} from "@src/hooks/bucket";
import { mockNotifyError } from "@test/testUtils";
import { renderHook } from "@testing-library/react";

describe("bucket hooks", () => {
  describe("useBucket", () => {
    let getDataMock;
    const testBucket = {
      id: "foo",
      name: "bar",
    };

    beforeEach(() => {
      getDataMock = vi.fn().mockResolvedValue(testBucket);
      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            getData: getDataMock,
          };
        },
      });
    });

    it("returns the expected bucket", async () => {
      const { result } = renderHook(() => useBucket("bid"));
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => {
        expect(result.current).toStrictEqual(testBucket);
      });
      expect(getDataMock).toHaveBeenCalled();
    });

    it("calls the API again if the bid or cacheBust values change", async () => {
      let rendered = renderHook(({ bid, cb }) => useBucket(bid, cb), {
        initialProps: { bid: "bid", cb: undefined },
      });
      rendered.rerender({ bid: "bid" });
      rendered.rerender({ bid: "bid" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getDataMock).toHaveBeenCalledTimes(1);

      rendered.rerender({ bid: "bid", cb: 0 });
      rendered.rerender({ bid: "bid", cb: 1 });
      rendered.rerender({ bid: "biz" });
      rendered.rerender({ bid: "biz", cb: 0 });
      rendered.rerender({ bid: "biz", cb: 1 });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getDataMock).toHaveBeenCalledTimes(6);
    });

    it("calls notifyError if there is a failure", async () => {
      const notifyErrorMock = mockNotifyError();
      getDataMock.mockRejectedValue(new Error("Test foo"));
      renderHook(() => useBucket("bid"));
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Unable to load bucket",
          expect.any(Error)
        );
      });
    });
  });

  describe("useBucketPermissions", () => {
    let getPermissionsMock;
    const testPermissions = {
      write: ["account:foo"],
    };

    beforeEach(() => {
      getPermissionsMock = vi.fn().mockResolvedValue(testPermissions);
      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            getPermissions: getPermissionsMock,
          };
        },
      });
    });

    it("returns the expected permissions", async () => {
      const { result } = renderHook(() => useBucketPermissions("bid"));
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => {
        expect(result.current).toStrictEqual(testPermissions);
      });
      expect(getPermissionsMock).toHaveBeenCalled();
    });

    it("calls the API again if the bid or cacheBust values change", async () => {
      let rendered = renderHook(
        ({ bid, cb }) => useBucketPermissions(bid, cb),
        { initialProps: { bid: "bid", cb: undefined } }
      );
      rendered.rerender({ bid: "bid" });
      rendered.rerender({ bid: "bid" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getPermissionsMock).toHaveBeenCalledTimes(1);

      rendered.rerender({ bid: "bid", cb: 0 });
      rendered.rerender({ bid: "bid", cb: 1 });
      rendered.rerender({ bid: "biz" });
      rendered.rerender({ bid: "biz", cb: 0 });
      rendered.rerender({ bid: "biz", cb: 1 });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getPermissionsMock).toHaveBeenCalledTimes(6);
    });

    it("calls notifyError if there is a failure", async () => {
      const notifyErrorMock = mockNotifyError();
      getPermissionsMock.mockRejectedValue(new Error("Test foo"));
      renderHook(() => useBucketPermissions("bid"));
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Unable to load bucket permissions",
          expect.any(Error)
        );
      });
    });
  });

  describe("useBucketHistory", () => {
    let listHistoryMock;

    beforeAll(() => {
      listHistoryMock = vi.fn();
      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            listHistory: listHistoryMock,
          };
        },
      });
    });

    it("should call the history enpoint and return the expected results filtered on bucket id", async () => {
      listHistoryMock.mockReturnValue({
        data: [{ foo: "bar" }],
        hasNextPage: false,
        next: null,
      });
      const { result } = renderHook(() => useBucketHistory("bid"));

      expect(result.current).toEqual({});

      await vi.waitFor(() => {
        expect(result.current).toMatchObject({
          data: [{ foo: "bar" }],
          hasNextPage: false,
        });
      });

      expect(listHistoryMock).toHaveBeenCalled();
    });

    it("should append the results when using the next function", async () => {
      listHistoryMock.mockReturnValue({
        data: Array.from(Array(10).keys()),
        hasNextPage: true,
        next: () => {
          return {
            data: Array.from(Array(10).keys()),
            hasNextPage: false,
            next: null,
          };
        },
      });
      const { result } = renderHook(() => useBucketHistory("bid"));

      expect(result.current).toEqual({});

      await vi.waitFor(() => {
        expect(result.current.data).toHaveLength(10);
        expect(result.current.hasNextPage).toBeTruthy();
      });

      expect(listHistoryMock).toHaveBeenCalled();
      result.current.next();

      await vi.waitFor(() => {
        expect(result.current.data).toHaveLength(20);
        expect(result.current.hasNextPage).toBeFalsy();
      });
    });

    it("should create an error message when an exception occurs", async () => {
      let notifyErrorMock = mockNotifyError();
      listHistoryMock.mockImplementation(() => {
        throw new Error("test error");
      });

      renderHook(() => useBucketHistory("bid"));

      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Error fetching bucket history",
          expect.any(Error)
        );
      });
    });
  });

  describe("useBucketList", () => {
    let listBucketsMock, batchMock;
    const testBuckets = [
      {
        id: "test1",
        name: "test1",
      },
      {
        id: "test2",
        name: "test2",
      },
      {
        id: "user-bucket",
        name: "user-bucket",
      },
    ];
    const testBatchResult = testBuckets.map(x => {
      return {
        status: 200,
        body: {
          data: [{ id: "test1" }, { id: "test2" }],
        },
      };
    });

    beforeEach(() => {
      listBucketsMock = vi.fn().mockResolvedValue({ data: testBuckets });
      batchMock = vi.fn().mockResolvedValue(testBatchResult);
      vi.spyOn(client, "getClient").mockReturnValue({
        listBuckets: listBucketsMock,
        batch: batchMock,
      });
    });

    it("returns the expected list with permissions applied", async () => {
      const permissions = [
        {
          resource_name: "bucket",
          bucket_id: "test1",
          permissions: ["foo1", "foo2"],
        },
        {
          resource_name: "collection",
          bucket_id: "test2",
          collection_id: "test2",
          permissions: ["foo3", "foo4"],
        },
      ];
      const expectedResult = [
        {
          canCreateCollection: false, // cannot create as bucket permissions are defined
          collections: [
            {
              id: "test1",
              permissions: [],
              readonly: true,
            },
            {
              id: "test2",
              permissions: [],
              readonly: true,
            },
          ],
          id: "test1",
          name: "test1",
          permissions: [
            // test permisisons
            "foo1",
            "foo2",
          ],
          readonly: true,
        },
        {
          canCreateCollection: true, // can create as bucket permissions are NOT defined
          collections: [
            {
              id: "test1",
              permissions: [],
              readonly: true,
            },
            {
              id: "test2",
              permissions: [
                // test permisisons
                "foo3",
                "foo4",
              ],
              readonly: true,
            },
          ],
          id: "test2",
          name: "test2",
          permissions: [],
          readonly: true,
        },
        {
          canCreateCollection: true, // can create as personal bucket
          collections: [
            {
              id: "test1",
              permissions: [],
              readonly: true,
            },
            {
              id: "test2",
              permissions: [],
              readonly: true,
            },
          ],
          id: "user-bucket",
          name: "user-bucket",
          permissions: [],
          readonly: true,
        },
      ];
      const { result } = renderHook(() =>
        useBucketList(permissions, "user-bucket")
      );
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => {
        expect(result.current).toMatchObject(expectedResult);
      });
      expect(listBucketsMock).toHaveBeenCalled();
      expect(batchMock).toHaveBeenCalled();
    });

    it("triggers a notification error if the client throws an error", async () => {
      const notifyErrorMock = mockNotifyError();
      listBucketsMock.mockRejectedValue(new Error("Test foo"));
      renderHook(() => useBucketList());
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Unable to load buckets",
          expect.any(Error)
        );
      });
    });
  });

  describe("expandBucketsCollections", () => {
    const buckets = [
      { id: "b1", permissions: [], collections: [], readonly: undefined },
      { id: "b2", permissions: [], collections: [], readonly: undefined },
    ];

    function bucketPerm(bucket_id, permissions) {
      return { resource_name: "bucket", bucket_id, permissions };
    }

    function collectionPerm(bucket_id, collection_id, permissions) {
      return {
        resource_name: "collection",
        bucket_id,
        collection_id,
        permissions,
      };
    }

    const permissions = [
      { resource_name: "root", permissions: ["bucket:create"] },
      bucketPerm("b1", ["read"]),
      bucketPerm("b2", ["read"]),
      bucketPerm("b4", ["write"]),
      collectionPerm("b1", "b1c1", ["read", "write"]),
      collectionPerm("b2", "b2c1", ["read"]),
      collectionPerm("b3", "b3c1", ["read", "write"]),
      bucketPerm("foo", ["read"]),
      collectionPerm("foo", "foo", ["read"]),
    ];

    const tree = expandBucketsCollections(buckets, permissions, 2);

    it("should denote a bucket as writable", () => {
      expect(tree.find(b => b.id === "b4").readonly).toBe(false);
    });

    it("should denote a bucket as readonly", () => {
      expect(tree.find(b => b.id === "b2").readonly).toBe(true);
    });

    it("should denote a collection as writable", () => {
      const b1c1 = tree
        .find(b => b.id === "b1")
        .collections.find(c => c.id === "b1c1");
      expect(b1c1.readonly).toBe(false);
    });

    it("should denote a collection as readonly", () => {
      const b2c1 = tree
        .find(b => b.id === "b2")
        .collections.find(c => c.id === "b2c1");
      expect(b2c1.readonly).toBe(true);
    });

    it("should infer an implicit bucket", () => {
      expect(tree.find(b => b.id === "b3").readonly).toBe(true);
    });

    it("should distinguish resource ids", () => {
      const fooBucket = tree.find(b => b.id === "foo");
      expect(fooBucket).toBeDefined();
      expect(fooBucket.collections.find(c => c.id === "foo")).toBeDefined();
    });
  });
});
