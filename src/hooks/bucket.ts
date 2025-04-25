import { notifyError } from "./notifications";
import { getClient } from "@src/client";
import { DEFAULT_SORT, MAX_PER_PAGE } from "@src/constants";
import type {
  RecordData,
  RecordResource,
  ResourceHistoryEntry,
} from "@src/types";
import { PaginationResult } from "kinto/lib/http/base";
import { useEffect, useState } from "react";

export function useBucket(bid: string, cacheBust?: number) {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    getClient()
      .bucket(bid)
      .getData()
      .then(result => {
        setVal(result);
      })
      .catch(err => {
        notifyError("Unable to load bucket", err);
      });
  }, [bid, cacheBust]);

  return val;
}

export function useBucketHistory(bid: string, cacheBust?: number) {
  const [val, setVal] = useState({});

  useEffect(() => {
    fetchHistory(bid, [], setVal);
  }, [bid, cacheBust]);

  return val;
}

async function fetchHistory(bid: string, curData, setVal, nextPageFn?) {
  let result;

  try {
    if (nextPageFn) {
      result = await nextPageFn();
    } else {
      result = await getClient()
        .bucket(bid)
        .listHistory({
          limit: MAX_PER_PAGE,
          sort: DEFAULT_SORT,
          filters: {
            exclude_resource_name: "record",
          },
        });
    }
  } catch (err) {
    notifyError("Error fetching bucket history", err);
    return;
  }

  const data = curData.concat(result.data);

  setVal({
    data,
    hasNextPage: result.hasNextPage,
    next: () => {
      if (result.hasNextPage && result.next) {
        return fetchHistory(bid, data, setVal, result.next);
      }
    },
  });
}
