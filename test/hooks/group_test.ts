import * as client from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import { useGroup, useGroupHistory, useGroupList } from "@src/hooks/group";
import { mockNotifyError } from "@test/testUtils";
import { renderHook } from "@testing-library/react";

describe("group hooks", () => {
  describe("useGroup", () => {
    let getGroupMock;
    const testGroup = { id: "foo" };

    beforeEach(() => {
      getGroupMock = vi.fn().mockResolvedValue(testGroup);
      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            getGroup: getGroupMock,
          };
        },
      });
    });

    it("returns the expected group", async () => {
      const { result } = renderHook(() => useGroup("bid", "gid"));
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => {
        expect(result.current).toStrictEqual(testGroup);
      });
      expect(getGroupMock).toHaveBeenCalled();
    });

    it("calls the API again if the bid, gid, or cacheBust values change", async () => {
      const rendered = renderHook(
        ({ bid, gid, cb }) => useGroup(bid, gid, cb),
        {
          initialProps: { bid: "bid", gid: "gid", cb: undefined },
        }
      );
      rendered.rerender({ bid: "bid", gid: "gid" });
      rendered.rerender({ bid: "bid", gid: "gid" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getGroupMock).toHaveBeenCalledTimes(1);

      rendered.rerender({ bid: "biz", gid: "gid" });
      rendered.rerender({ bid: "biz", gid: "gid", cb: 0 });
      rendered.rerender({ bid: "biz", gid: "gid", cb: 1 });
      rendered.rerender({ bid: "biz", gid: "gid1" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getGroupMock).toHaveBeenCalledTimes(5);
    });

    it("calls notifyError if there is a client failure", async () => {
      const notifyErrorMock = mockNotifyError();
      getGroupMock.mockRejectedValue(new Error("test foo"));
      renderHook(() => useGroup("bid", "gid"));
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Unable to load group",
          expect.any(Error)
        );
      });
    });
  });

  describe("useGroupList", () => {
    let listGroupsMock;
    const testGroups = [{ id: "foo" }, { id: "bar" }];

    beforeEach(() => {
      listGroupsMock = vi.fn().mockResolvedValue({
        data: testGroups,
      });
      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            listGroups: listGroupsMock,
          };
        },
      });
    });

    it("returns the expected list of groups", async () => {
      const { result } = renderHook(() => useGroupList("bid", "cid", "sort"));
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => {
        expect(result.current).toMatchObject({ data: testGroups });
      });
      expect(listGroupsMock).toHaveBeenCalled();
    });

    it("calls the API again if bid changes", async () => {
      const rendered = renderHook(({ bid }) => useGroupList(bid), {
        initialProps: { bid: "bid" },
      });
      rendered.rerender({ bid: "bid" });
      rendered.rerender({ bid: "bid" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(listGroupsMock).toHaveBeenCalledTimes(1);

      rendered.rerender({ bid: "biz" });
      rendered.rerender({ bid: "big" });
      rendered.rerender({ bid: "biz" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(listGroupsMock).toHaveBeenCalledTimes(4);
    });

    it("calls notifyError when a client error is thrown", async () => {
      const notifyErrorMock = mockNotifyError();
      listGroupsMock.mockRejectedValue(new Error("Test foo"));
      renderHook(() => useGroupList("bid"));
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Error fetching group list",
          expect.any(Error)
        );
      });
    });
  });

  describe("useGroupHistory", () => {
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

    it("should call the history endpoint and return the expected results filtered on group id", async () => {
      listHistoryMock.mockReturnValue({
        data: [{ foo: "bar" }],
        hasNextPage: false,
        next: null,
      });
      const { result } = renderHook(() => useGroupHistory("bid", "gid", {}));

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
          group_id: "gid",
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
      const { result } = renderHook(() => useGroupHistory("bid", "gid", {}));

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
      const notifyErrorMock = mockNotifyError();
      listHistoryMock.mockImplementation(() => {
        throw new Error("test error");
      });

      renderHook(() => useGroupHistory("bid", "gid", {}));

      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Error fetching group history",
          expect.any(Error)
        );
      });
    });
  });
});
