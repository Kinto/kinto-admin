import { notifyError } from "./notifications";
import { getClient } from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import type {
  ListHistoryResult,
  ListResult,
  RecordData,
  RecordResource,
} from "@src/types";
import { useEffect, useState } from "react";

type RecordListResult =
  | ListResult<RecordData>
  | {
      totalRecords?: number;
      lastModified?: number;
    };

export function useRecordList(
  bid: string,
  cid: string,
  sort: string,
  fetchAll = false,
  cacheBust?: number
): RecordListResult {
  const [val, setVal] = useState({});

  useEffect(() => {
    setVal({});
    if (!bid || !cid) return;
    if (sort) {
      fetchRecords(bid, cid, sort, fetchAll, [], setVal);
    }
  }, [bid, cid, sort, cacheBust]);

  return val;
}

async function fetchRecords(
  bid: string,
  cid: string,
  sort: string,
  fetchAll: boolean,
  curData,
  setVal,
  nextPageFn?
) {
  let result, totalCount;

  try {
    if (nextPageFn) {
      result = await nextPageFn();
    } else {
      result = await getClient().bucket(bid).collection(cid).listRecords({
        sort,
        limit: MAX_PER_PAGE,
      });
    }
    totalCount = await getClient()
      .bucket(bid)
      .collection(cid)
      .getTotalRecords();
  } catch (err) {
    notifyError("Error fetching record list", err);
    return;
  }

  const data = curData.concat(result.data);

  if (fetchAll && result.hasNextPage) {
    fetchRecords(bid, cid, sort, fetchAll, data, setVal, result.next);
    return;
  }

  setVal({
    data,
    hasNextPage: result.hasNextPage,
    lastModified: result.last_modified,
    totalRecords: totalCount,
    next: () => {
      if (result.hasNextPage && result.next) {
        fetchRecords(bid, cid, sort, fetchAll, data, setVal, result.next);
      }
    },
  });
}

export function useRecord(
  bid: string,
  cid: string,
  rid: string,
  cacheBust?: number
): RecordResource | undefined {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    if (val) setVal(undefined);
    if (!rid) return;
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
  }, [bid, cid, rid, cacheBust]);

  return val;
}

export function useRecordHistory(
  bid: string,
  cid: string,
  rid: string,
  cacheBust?: number
): ListHistoryResult {
  const [val, setVal] = useState({});

  useEffect(() => {
    fetchHistory(bid, cid, rid, [], setVal);
  }, [bid, cid, rid, cacheBust]);

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
