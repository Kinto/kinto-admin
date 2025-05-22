import * as client from "@src/client";
import {
  useBucket,
  useBucketHistory,
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
});
