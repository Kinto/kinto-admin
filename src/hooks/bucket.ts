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
