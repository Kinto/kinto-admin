import { notifyError } from "./notifications";
import { getClient } from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import type { ResourceHistoryEntry } from "@src/types";
import { PaginationResult } from "kinto/lib/http/base";
import { useEffect, useState } from "react";

type RecordHistoryResult = {
  data?: PaginationResult<ResourceHistoryEntry>;
  hasNextPage?: boolean;
  next?: Promise<PaginationResult<ResourceHistoryEntry>> | null;
};

export function useRecordHistory(
  bid: string,
  cid: string,
  rid: string
): RecordHistoryResult {
  const [val, setVal] = useState({});

  useEffect(() => {
    fetchHistory(bid, cid, rid, [], setVal);
  }, []);

  return val;
}

async function fetchHistory(
  bid: string,
  cid: string,
  rid: string,
  curData,
  setVal,
  nextPageFn?
) {
  let result;

  try {
    if (nextPageFn) {
      result = await nextPageFn();
    } else {
      result = await getClient()
        .bucket(bid)
        .listHistory({
          limit: MAX_PER_PAGE,
          filters: {
            collection_id: cid,
            record_id: rid,
          },
        });
    }
  } catch (err) {
    notifyError("Error fetching record history", err);
    return;
  }

  const data = curData.concat(result.data);

  setVal({
    data,
    hasNextPage: result.hasNextPage,
    next: () => {
      if (result.hasNextPage && result.next) {
        fetchHistory(bid, cid, rid, data, setVal, result.next);
      }
    },
  });
}
