import * as client from "@src/client";
import { useSignoff } from "@src/hooks/signoff";
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

    it("Defaults to null if no signer object is provided", async () => {
      const { result } = renderHook(() => useSignoff("bid", "cid", null));
      await vi.waitFor(() => {
        expect(result.current).toBeNull();
      });
    });

    it("Defaults to undefined if no signer resources are found", async () => {
      const { result } = renderHook(() => useSignoff("bid", "cid", signer));
      await vi.waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("Uses a SignoffCollectionsInfo object a signer resource is found", async () => {
      const { result } = renderHook(() => useSignoff("source", "cid", signer));
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
          },
        });
      });
    });

    it("Calculates changes for the preview collection if status is work-in-progress", async () => {
      getDataMock = vi.fn().mockResolvedValue({
        status: "not-work-in-progress",
        last_modified: 42,
      });
      const { result } = renderHook(() => useSignoff("source", "cid", signer));
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

    it.only("Calculates changes for the destination collection if status is not signed signed", async () => {
      const { result } = renderHook(() => useSignoff("source", "cid", signer));
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
      renderHook(() => useSignoff("source", "cid", signer));
      await vi.waitFor(() => {
        expect(listRecordsMock).toHaveBeenCalledWith({
          since: "42",
          fields: ["deleted"],
        });
      });
    });
  });
});
