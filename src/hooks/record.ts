import { notifyError } from "./notifications";
import { getClient } from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import type {
  RecordData,
  RecordResource,
  ResourceHistoryEntry,
} from "@src/types";
import { PaginationResult } from "kinto/lib/http/base";
import { useEffect, useState } from "react";

type RecordHistoryResult = {
  data?: PaginationResult<ResourceHistoryEntry>;
  hasNextPage?: boolean;
  next?: Promise<PaginationResult<ResourceHistoryEntry>> | null;
};

type RecordListResult = {
  data?: PaginationResult<RecordData>;
  hasNextPage?: boolean;
  totalRecords?: number;
  lastModified?: number;
  next?: Promise<PaginationResult<RecordData>> | null;
};

export function useRecord(
  bid: string,
  cid: string,
  rid: string
): RecordResource | undefined {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    getClient()
      .bucket(bid)
      .collection(cid)
      .getRecord(rid)
      .then(result => {
        setVal(result);
      })
      .catch(err => {
        notifyError("Unable to load record", err);
      });
  }, []);

  return val;
}

export function useRecords(
  bid: string,
  cid: string,
  sort: string
): RecordListResult {
  const [val, setVal] = useState({});

  useEffect(() => {
    fetchRecords(bid, cid, sort, [], setVal);
  }, [bid, cid, sort]);

  return val;
}

async function fetchRecords(
  bid: string,
  cid: string,
  sort: string,
  curData,
  setVal,
  nextPageFn?
) {
  let result;

  try {
    if (nextPageFn) {
      result = await nextPageFn();
    } else {
      result = await getClient().bucket(bid).collection(cid).listRecords({
        sort,
        limit: MAX_PER_PAGE,
      });
    }
  } catch (err) {
    notifyError("Error fetching record list", err);
    return;
  }

  const data = curData.concat(result.data);

  setVal({
    data,
    hasNextPage: result.hasNextPage,
    lastModified: result.last_modified,
    totalRecords: result.totalRecords,
    next: () => {
      if (result.hasNextPage && result.next) {
        fetchRecords(bid, cid, sort, data, setVal, result.next);
      }
    },
  });
}

export function useRecordHistory(
  bid: string,
  cid: string,
  rid: string
): RecordHistoryResult {
  const [val, setVal] = useState({});

  useEffect(() => {
    fetchHistory(bid, cid, rid, [], setVal);
  }, [bid, cid, rid]);

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
