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

export function useCollection(bid: string, cid: string, cacheBust?: number) {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    setVal(undefined);
    getClient()
      .bucket(bid)
      .collection(cid)
      .getData()
      .then(result => {
        setVal(result);
      })
      .catch(err => {
        notifyError("Unable to load collection", err);
      });
  }, [bid, cid, cacheBust]);

  return val;
}

export function useCollectionPermissions(
  bid: string,
  cid: string,
  cacheBust?: number
) {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    getClient()
      .bucket(bid)
      .collection(cid)
      .getPermissions()
      .then(result => {
        setVal(result);
      })
      .catch(err => {
        notifyError("Unable to load collection", err);
      });
  }, [bid, cid, cacheBust]);

  return val;
}

export function useCollectionList(bid: string, cacheBust?: number) {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    setVal(undefined);
    fetchCollections(bid, [], setVal);
  }, [bid, cacheBust]);

  return val;
}

async function fetchCollections(bid: string, curData, setVal, nextPageFn?) {
  let result;

  try {
    if (nextPageFn) {
      result = await nextPageFn();
    } else {
      result = await getClient().bucket(bid).listCollections({
        limit: MAX_PER_PAGE,
      });
    }
  } catch (err) {
    notifyError("Error fetching collection list", err);
    return;
  }

  const data = curData.concat(result.data);

  setVal({
    data,
    hasNextPage: result.hasNextPage,
    lastModified: result.last_modified,
    next: () => {
      if (result.hasNextPage && result.next) {
        return fetchCollections(bid, data, setVal, result.next);
      }
    },
  });
}
