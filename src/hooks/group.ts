import { notifyError } from "./notifications";
import { getClient } from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import { PaginationResult } from "kinto/lib/http/base";
import { HistoryEntry } from "kinto/lib/types";
import { useEffect, useState } from "react";

type listHistoryResult = {
  data?: PaginationResult<HistoryEntry<any>>;
  hasNextPage?: boolean;
  next?: Promise<PaginationResult<HistoryEntry<any>>> | null;
};

export function useListHistory(bid: string, gid: string): listHistoryResult {
  const [val, setVal] = useState({});

  useEffect(() => {
    fetchHistory(bid, gid, [], setVal);
  }, []);

  return val;
}

async function fetchHistory(
  bid: string,
  gid: string,
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
            group_id: gid,
          },
        });
    }
  } catch (err) {
    notifyError("Error fetching group history", err);
    return;
  }

  const data = curData.concat(result.data);

  setVal({
    data,
    hasNextPage: result.hasNextPage,
    next: () => {
      if (result.hasNextPage && result.next) {
        fetchHistory(bid, gid, data, setVal, result.next);
      }
    },
  });
}
