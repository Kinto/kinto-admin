import * as client from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import {
  useCollection,
  useCollectionHistory,
  useCollectionList,
  useCollectionPermissions,
} from "@src/hooks/collection";
import { mockNotifyError } from "@test/testUtils";
import { renderHook } from "@testing-library/react";

describe("collection hooks", () => {
  describe("useCollection", () => {
    let getDataMock;
    const testCollection = {
      foo: "bar",
    };

    beforeEach(() => {
      getDataMock = vi.fn().mockResolvedValue(testCollection);
      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            collection: cid => {
              return {
                getData: getDataMock,
              };
            },
          };
        },
      });
    });

    it("returns the expected collection object", async () => {
      const { result } = renderHook(() => useCollection("bid", "cid"));
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => {
        expect(result.current).toStrictEqual(testCollection);
      });
      expect(getDataMock).toHaveBeenCalled();
    });

    it("calls the API again if the bid, cid, or cacheBust values change", async () => {
      let rendered = renderHook(
        ({ bid, cid, cb }) => useCollection(bid, cid, cb),
        {
          initialProps: { bid: "bid", cid: "cid", cb: undefined },
        }
      );
      rendered.rerender({ bid: "bid", cid: "cid" });
      rendered.rerender({ bid: "bid", cid: "cid" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getDataMock).toHaveBeenCalledTimes(1);

      rendered.rerender({ bid: "bid", cid: "cid1" });
      rendered.rerender({ bid: "bid1", cid: "cid1" });
      rendered.rerender({ bid: "bid1", cid: "cid" });
      rendered.rerender({ bid: "bid1", cid: "cid", cb: 1 });
      rendered.rerender({ bid: "bid1", cid: "cid", cb: 2 });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getDataMock).toHaveBeenCalledTimes(6);
    });

    it("calls notifyError when a client error is thrown", async () => {
      const notifyErrorMock = mockNotifyError();
      getDataMock.mockRejectedValue(new Error("test foo"));
      renderHook(() => useCollection("bid", "cid"));
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Unable to load collection",
          expect.any(Error)
        );
      });
    });
  });

  describe("useCollectionPermissions", () => {
    let getPermissionsMock;
    const testPermissions = {
      write: ["account:test"],
    };

    beforeEach(() => {
      getPermissionsMock = vi.fn().mockResolvedValue(testPermissions);
      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            collection: cid => {
              return {
                getPermissions: getPermissionsMock,
              };
            },
          };
        },
      });
    });

    it("returns the expected collection permissions object", async () => {
      const { result } = renderHook(() =>
        useCollectionPermissions("bid", "cid")
      );
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => {
        expect(result.current).toStrictEqual(testPermissions);
      });
      expect(getPermissionsMock).toHaveBeenCalled();
    });

    it("calls the API again if the bid, cid, or cacheBust values change", async () => {
      let rendered = renderHook(
        ({ bid, cid, cb }) => useCollectionPermissions(bid, cid, cb),
        {
          initialProps: { bid: "bid", cid: "cid", cb: undefined },
        }
      );
      rendered.rerender({ bid: "bid", cid: "cid" });
      rendered.rerender({ bid: "bid", cid: "cid" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getPermissionsMock).toHaveBeenCalledTimes(1);

      rendered.rerender({ bid: "bid", cid: "cid1" });
      rendered.rerender({ bid: "bid1", cid: "cid1" });
      rendered.rerender({ bid: "bid1", cid: "cid" });
      rendered.rerender({ bid: "bid1", cid: "cid", cb: 1 });
      rendered.rerender({ bid: "bid1", cid: "cid", cb: 2 });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getPermissionsMock).toHaveBeenCalledTimes(6);
    });

    it("calls notifyError when a client error is thrown", async () => {
      const notifyErrorMock = mockNotifyError();
      getPermissionsMock.mockRejectedValue(new Error("test foo"));
      renderHook(() => useCollectionPermissions("bid", "cid"));
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Unable to load collection permissions",
          expect.any(Error)
        );
      });
    });
  });

  describe("useCollectionList", () => {
    let listCollectionsMock;
    const testCollections = [{ id: "foo" }, { id: "bar" }];

    beforeEach(() => {
      listCollectionsMock = vi.fn().mockResolvedValue({
        data: testCollections,
        hasNextPage: false,
        last_modified: 1,
      });
      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            listCollections: listCollectionsMock,
          };
        },
      });
    });

    it("returns the expected collection list", async () => {
      const { result } = renderHook(() => useCollectionList("bid"));
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => {
        expect(result.current).toMatchObject({
          data: testCollections,
          hasNextPage: false,
          lastModified: 1,
        });
      });
      expect(listCollectionsMock).toHaveBeenCalled();
    });

    it("calls the API again if the bid or cacheBust values change", async () => {
      let rendered = renderHook(({ bid, cb }) => useCollectionList(bid, cb), {
        initialProps: { bid: "bid", cb: undefined },
      });
      rendered.rerender({ bid: "bid" });
      rendered.rerender({ bid: "bid" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(listCollectionsMock).toHaveBeenCalledTimes(1);

      rendered.rerender({ bid: "bid", cb: 0 });
      rendered.rerender({ bid: "bid", cb: 1 });
      rendered.rerender({ bid: "biz", cb: 0 });
      rendered.rerender({ bid: "biz", cb: 1 });
      rendered.rerender({ bid: "biz", cb: 2 });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(listCollectionsMock).toHaveBeenCalledTimes(6);
    });

    it("calls notifyError when a client error is thrown", async () => {
      const notifyErrorMock = mockNotifyError();
      listCollectionsMock.mockRejectedValue(new Error("Test foo"));
      renderHook(() => useCollectionList("bid"));
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Error fetching collection list",
          expect.any(Error)
        );
      });
    });
  });

  describe("useCollectionHistory", () => {
    let listHistoryMock;

    beforeEach(() => {
      listHistoryMock = vi.fn();
      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            listHistory: listHistoryMock,
          };
        },
      });
    });

    it("should call the history endpoint with filters and return the expected results", async () => {
      listHistoryMock.mockResolvedValue({
        data: [{ foo: "bar" }],
        hasNextPage: false,
        next: null,
      });
      const { result } = renderHook(() =>
        useCollectionHistory("bid", "cid", {
          resource_name: "resource",
          exclude_user_id: "user",
          since: 1,
        })
      );
      expect(result.current).toEqual({});

      await vi.waitFor(() => {
        expect(result.current).toMatchObject({
          data: [{ foo: "bar" }],
          hasNextPage: false,
        });
      });

      expect(listHistoryMock).toHaveBeenCalledWith({
        limit: MAX_PER_PAGE,
        filters: {
          resource_name: "resource",
          exclude_user_id: "user",
          collection_id: "cid",
          "gt_target.data.last_modified": 1,
        },
      });
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
      const { result } = renderHook(() =>
        useCollectionHistory("bid", "gid", {})
      );

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

    it("calls the API again if the bid or cacheBust values change", async () => {
      listHistoryMock.mockResolvedValue({ data: [] });
      let rendered = renderHook(
        ({ bid, cid, filters, cb }) =>
          useCollectionHistory(bid, cid, filters, cb),
        {
          initialProps: { bid: "bid", cid: "cid", filters: {}, cb: undefined },
        }
      );
      rendered.rerender({ bid: "bid", cid: "cid", filters: {} });
      rendered.rerender({ bid: "bid", cid: "cid", filters: {} });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(listHistoryMock).toHaveBeenCalledTimes(1);

      rendered.rerender({ bid: "bid", cid: "cid1", filters: {} });
      rendered.rerender({ bid: "bid", cid: "cid1", filters: { foo: "bar" } });
      rendered.rerender({ bid: "bid", cid: "cid1", filters: { foo: "baz" } });
      rendered.rerender({ bid: "bid1", cid: "cid1", filters: { foo: "baz" } });
      rendered.rerender({ bid: "bid1", cid: "cid1", filters: {} });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(listHistoryMock).toHaveBeenCalledTimes(6);
    });

    it("should create an error message when an exception occurs", async () => {
      const notifyErrorMock = mockNotifyError();
      listHistoryMock.mockRejectedValue(new Error("Test foo"));
      renderHook(() => useCollectionHistory("bid", "cid", {}));
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Error fetching record history",
          expect.any(Error)
        );
      });
    });
  });
});
