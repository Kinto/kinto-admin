import { notifyError } from "./notifications";
import { getClient } from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import { GroupData, ListHistoryResult, ListResult } from "@src/types";
import { useEffect, useState } from "react";

export function useGroupHistory(bid: string, gid: string): ListHistoryResult {
  const [val, setVal] = useState({});

  useEffect(() => {
    fetchHistory(bid, gid, [], setVal);
  }, [bid, gid]);

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

export function useGroup(bid: string, gid: string, cacheBust?: number) {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    setVal(undefined);
    if (!bid || !gid) return;
    getClient()
      .bucket(bid)
      .getGroup(gid)
      .then(result => {
        setVal(result);
      })
      .catch(err => {
        notifyError("Unable to load group", err);
      });
  }, [bid, gid, cacheBust]);

  return val;
}

export function useGroupList(bid: string): ListResult<GroupData> | undefined {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    setVal(undefined);
    fetchGroups(bid, [], setVal);
  }, [bid]);

  return val;
}

async function fetchGroups(bid: string, curData, setVal, nextPageFn?) {
  let result;

  try {
    if (nextPageFn) {
      result = await nextPageFn();
    } else {
      result = await getClient().bucket(bid).listGroups({
        limit: MAX_PER_PAGE,
      });
    }
  } catch (err) {
    notifyError("Error fetching group list", err);
    return;
  }

  const data = curData.concat(result.data);

  setVal({
    data,
    hasNextPage: result.hasNextPage,
    lastModified: result.last_modified,
    next: () => {
      if (result.hasNextPage && result.next) {
        return fetchGroups(bid, data, setVal, result.next);
      }
    },
  });
}
