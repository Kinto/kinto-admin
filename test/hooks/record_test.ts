import * as client from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import { useRecord, useRecordHistory, useRecordList } from "@src/hooks/record";
import { mockNotifyError } from "@test/testUtils";
import { renderHook } from "@testing-library/react";

describe("record hooks", () => {
  describe("useRecord", () => {
    let getRecordMock;
    const testRecord = {
      data: { id: "foo" },
      permissions: { write: ["account:foo"] },
    };

    beforeEach(() => {
      getRecordMock = vi.fn().mockResolvedValue(testRecord);
      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            collection: cid => {
              return {
                getRecord: getRecordMock,
              };
            },
          };
        },
      });
    });

    it("returns the expected record object", async () => {
      const { result } = renderHook(() => useRecord("bid", "cid", "rid"));
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => {
        expect(result.current).toStrictEqual(testRecord);
      });
      expect(getRecordMock).toHaveBeenCalled();
    });

    it("calls the API again if the bid, cid, rid, or cacheBust values change", async () => {
      const rendered = renderHook(
        ({ bid, cid, rid, cb }) => useRecord(bid, cid, rid, cb),
        { initialProps: { bid: "bid", cid: "cid", rid: "rid", cb: undefined } }
      );
      rendered.rerender({ bid: "bid", cid: "cid", rid: "rid" });
      rendered.rerender({ bid: "bid", cid: "cid", rid: "rid" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getRecordMock).toHaveBeenCalledTimes(1);

      rendered.rerender({ bid: "bid", cid: "cid", rid: "rid1" });
      rendered.rerender({ bid: "bid", cid: "cid", rid: "rid1", cb: 0 });
      rendered.rerender({ bid: "bid", cid: "cid", rid: "rid1", cb: 1 });
      rendered.rerender({ bid: "bid", cid: "cid1", rid: "rid" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(getRecordMock).toHaveBeenCalledTimes(5);
    });

    it("calls notifyError when a client error is thrown", async () => {
      const notifyErrorMock = mockNotifyError();
      getRecordMock.mockRejectedValue(new Error("test foo"));
      renderHook(() => useRecord("bid", "cid", "rid"));
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Unable to load record",
          expect.any(Error)
        );
      });
    });
  });

  describe("useRecordList", () => {
    let listRecordsMock;
    let getTotalRecordsMock;
    const testRecords = [{ id: "foo" }, { id: "bar" }];

    beforeEach(() => {
      listRecordsMock = vi.fn().mockResolvedValue({
        data: testRecords,
        hasNextPage: false,
        last_modified: 1,
      });
      getTotalRecordsMock = vi.fn().mockResolvedValue(2);
      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            collection: cid => {
              return {
                listRecords: listRecordsMock,
                getTotalRecords: getTotalRecordsMock,
              };
            },
          };
        },
      });
    });

    it("returns the expected list of records", async () => {
      const { result } = renderHook(() => useRecordList("bid", "cid", "sort"));
      expect(result.current).toStrictEqual({});
      await vi.waitFor(() => {
        expect(result.current).toMatchObject({
          data: testRecords,
          hasNextPage: false,
          lastModified: 1,
          totalRecords: 2,
        });
      });
      expect(listRecordsMock).toHaveBeenCalled();
    });

    it("will fetch all records when prompted", async () => {
      const fakePages = {
        data: testRecords,
        hasNextPage: true,
        last_modified: 1,
      };
      listRecordsMock.mockResolvedValueOnce(fakePages);
      listRecordsMock.mockResolvedValueOnce(fakePages);
      listRecordsMock.mockResolvedValueOnce(fakePages);
      const { result } = renderHook(() =>
        useRecordList("bid", "cid", "sort", true)
      );
      expect(result.current).toStrictEqual({});
      await vi.waitFor(() => {
        expect(result.current).toMatchObject({
          data: [
            ...testRecords,
            ...testRecords,
            ...testRecords,
            ...testRecords,
          ],
        });
      });
      expect(listRecordsMock).toHaveBeenCalledTimes(4);
    });

    it("calls the API again if any parameters change", async () => {
      const rendered = renderHook(
        ({ bid, cid, sort, cb }) => useRecordList(bid, cid, sort, false, cb),
        {
          initialProps: { bid: "bid", cid: "cid", sort: "sort", cb: undefined },
        }
      );
      rendered.rerender({ bid: "bid", cid: "cid", sort: "sort" });
      rendered.rerender({ bid: "bid", cid: "cid", sort: "sort" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(listRecordsMock).toHaveBeenCalledTimes(1);

      rendered.rerender({ bid: "bid", cid: "cid1", sort: "sort" });
      rendered.rerender({ bid: "bid", cid: "cid1", sort: "sort", cb: 0 });
      rendered.rerender({ bid: "bid", cid: "cid1", sort: "sort", cb: 1 });
      rendered.rerender({ bid: "bid1", cid: "cid1", sort: "sort" });
      rendered.rerender({ bid: "bid1", cid: "cid1", sort: "sor1" });
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 50)));
      expect(listRecordsMock).toHaveBeenCalledTimes(6);
    });

    it("calls notifyError when a client error is thrown", async () => {
      const notifyErrorMock = mockNotifyError();
      listRecordsMock.mockRejectedValue(new Error("Test foo"));
      renderHook(() => useRecordList("bid", "cid", "sort"));
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Error fetching record list",
          expect.any(Error)
        );
      });
    });
  });

  describe("useRecordHistory", () => {
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

    it("should call the history endpoint and return the expected results filtered by record id", async () => {
      listHistoryMock.mockResolvedValue({
        data: [{ foo: "bar" }],
        hasNextPage: false,
        next: null,
      });
      const { result } = renderHook(() =>
        useRecordHistory("bid", "cid", "rid", {})
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
          collection_id: "cid",
          record_id: "rid",
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
        useRecordHistory("bid", "gid", "rid", {})
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

    it("should create an error message when an exception occurs", async () => {
      const notifyErrorMock = mockNotifyError();
      listHistoryMock.mockRejectedValue(new Error("Test foo"));
      renderHook(() => useRecordHistory("bid", "cid", "rid", {}));
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Error fetching record history",
          expect.any(Error)
        );
      });
    });
  });
});
