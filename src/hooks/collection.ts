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
