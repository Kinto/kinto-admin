import { notifyError } from "./notifications";
import { getClient } from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import type { RecordData, RecordResource } from "@src/types";
import { PaginationResult } from "kinto/lib/http/base";
import { useEffect, useState } from "react";

type RecordListResult = {
  data?: PaginationResult<RecordData>;
  hasNextPage?: boolean;
  totalRecords?: number;
  lastModified?: number;
  next?: Promise<PaginationResult<RecordData>> | null;
};

export function useRecordList(
  bid: string,
  cid: string,
  sort: string,
  cacheBust?: number
): RecordListResult {
  const [val, setVal] = useState({});

  useEffect(() => {
    if (sort) {
      fetchRecords(bid, cid, sort, [], setVal);
    }
  }, [bid, cid, sort, cacheBust]);

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

export function useRecord(
  bid: string,
  cid: string,
  rid: string,
  cacheBust?: number
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
  }, [bid, cid, rid, cacheBust]);

  return val;
}
