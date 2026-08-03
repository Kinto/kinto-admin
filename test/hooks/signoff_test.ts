import * as client from "@src/client";
import { useSignoff } from "@src/hooks/signoff";
import type { SignoffCollectionsInfo } from "@src/types";
import { mockNotifyError } from "@test/testUtils";
import { renderHook } from "@testing-library/react";

const signer = {
  resources: [
    {
      source: {
        bucket: "source",
      },
      destination: {
        bucket: "dest",
      },
      preview: {
        bucket: "prev",
      },
    },
  ],
  group_check_enabled: true,
  editors_group: "{collection_id}-editors",
  reviewers_group: "{collection_id}-reviewers",
  to_review_enabled: true,
};

const serverInfo = { capabilities: { signer } } as any;
const serverInfoNoSigner = { capabilities: {} } as any;

describe("signoff hooks", () => {
  describe("useSignoff", () => {
    let getRecordsTimestampMock, getDataMock, listRecordsMock;

    beforeEach(() => {
      getRecordsTimestampMock = vi.fn().mockResolvedValue("24");
      getDataMock = vi.fn().mockResolvedValue({
        status: "work-in-progress",
        last_modified: 42,
      });
      listRecordsMock = vi.fn().mockResolvedValue({
        data: [
          {
            id: "rid",
            last_modified: 50,
          },
        ],
        hasNextPage: false,
        last_modified: 1,
      });

      vi.spyOn(client, "getClient").mockReturnValue({
        bucket: bid => {
          return {
            collection: cid => {
              return {
                getRecordsTimestamp: getRecordsTimestampMock,
                getData: getDataMock,
                listRecords: listRecordsMock,
              };
            },
          };
        },
      });
    });

    it("Defaults to null if signer capability is absent", async () => {
      const { result } = renderHook(() =>
        useSignoff("bid", "cid", serverInfoNoSigner)
      );
      await vi.waitFor(() => {
        expect(result.current).toBeNull();
      });
    });

    it("Defaults to undefined if no signer resources are found", async () => {
      const { result } = renderHook(() => useSignoff("bid", "cid", serverInfo));
      await vi.waitFor(() => {
        expect(result.current).toBeNull();
      });
    });

    it("Uses a SignoffCollectionsInfo object if a signer resource is found", async () => {
      const { result } = renderHook(() =>
        useSignoff("source", "cid", serverInfo)
      );
      await vi.waitFor(() => {
        expect(result.current).toStrictEqual({
          destination: {
            bucket: "dest",
            collection: "cid",
          },
          preview: {
            bucket: "prev",
            collection: "cid",
          },
          source: {
            bucket: "source",
            collection: "cid",
            isLoading: false,
            lastEditBy: undefined,
            lastEditDate: null,
            lastEditorComment: undefined,
            lastReviewBy: undefined,
            lastReviewDate: null,
            lastReviewRequestBy: undefined,
            lastReviewRequestDate: null,
            lastReviewerComment: undefined,
            lastSignatureBy: undefined,
            lastSignatureDate: null,
            status: "work-in-progress",
          },
          changesOnPreview: null,
          changesOnSource: {
            deleted: 0,
            since: 24,
            updated: 1,
          },
        });
      });
    });

    it("Calculates changes for the preview collection if status is work-in-progress", async () => {
      getDataMock = vi.fn().mockResolvedValue({
        status: "not-work-in-progress",
        last_modified: 42,
      });
      const { result } = renderHook(() =>
        useSignoff("source", "cid", serverInfo)
      );
      await vi.waitFor(() => {
        expect(result.current).toMatchObject({
          changesOnPreview: {
            deleted: 0,
            since: 24,
            updated: 1,
          },
          destination: {
            bucket: "dest",
            collection: "cid",
          },
          preview: {
            bucket: "prev",
            collection: "cid",
          },
          source: {
            bucket: "source",
            collection: "cid",
          },
        });
      });
    });

    it("Calculates changes for the destination collection if status is not signed signed", async () => {
      const { result } = renderHook(() =>
        useSignoff("source", "cid", serverInfo)
      );
      await vi.waitFor(() => {
        expect(result.current).toMatchObject({
          changesOnSource: {
            deleted: 0,
            since: 24,
            updated: 1,
          },
          destination: {
            bucket: "dest",
            collection: "cid",
          },
          preview: {
            bucket: "prev",
            collection: "cid",
          },
          source: {
            bucket: "source",
            collection: "cid",
          },
        });
      });
    });

    it("Falls back to collection last_modified getRecordsTimestamp returns nothing", async () => {
      getRecordsTimestampMock.mockResolvedValue(undefined);
      renderHook(() => useSignoff("source", "cid", serverInfo));
      await vi.waitFor(() => {
        expect(listRecordsMock).toHaveBeenCalledWith({
          since: "42",
          fields: ["deleted"],
        });
      });
    });

    it("Notifies and leaves the loading state if loading fails", async () => {
      const notifyErrorMock = mockNotifyError();
      getDataMock.mockRejectedValue(new Error("boom"));

      const { result } = renderHook(() =>
        useSignoff("source", "cid", serverInfo)
      );

      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalled();
      });
      expect((result.current as SignoffCollectionsInfo).source.isLoading).toBe(
        false
      );
    });

    it("Stale request should not overwrite latest info", async () => {
      let resolveStale;
      getDataMock.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            // Won't resolve immediately.
            resolveStale = () =>
              resolve({ status: "work-in-progress", last_modified: 1 });
          })
      );
      const { result, rerender } = renderHook(
        ({ cacheBust }) => useSignoff("source", "cid", serverInfo, cacheBust),
        { initialProps: { cacheBust: 0 } }
      );

      // Bump the cache, while the other is still pending.
      getDataMock.mockResolvedValue({ status: "to-review", last_modified: 2 });
      rerender({ cacheBust: 1 });
      await vi.waitFor(() => {
        expect((result.current as SignoffCollectionsInfo).source.status).toBe(
          "to-review"
        );
      });

      // Resolve first promise. Shouldn't overwrite the content of the lastest one.
      resolveStale();
      await new Promise(resolve => setTimeout(resolve, 10));
      expect((result.current as SignoffCollectionsInfo).source.status).toBe(
        "to-review"
      );
    });

    it("Resets when the collection is not concerned with signoff anymore", async () => {
      const { result, rerender } = renderHook(
        ({ bid }) => useSignoff(bid, "cid", serverInfo),
        { initialProps: { bid: "source" } }
      );
      await vi.waitFor(() => {
        expect((result.current as SignoffCollectionsInfo).source.status).toBe(
          "work-in-progress"
        );
      });
      rerender({ bid: "unsigned" });
      await vi.waitFor(() => {
        expect(result.current).toBeNull();
      });
    });
  });
});
