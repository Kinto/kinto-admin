import { notifyError } from "./notifications";
import { useServerInfo } from "./session";
import { getClient } from "@src/client";
import { MAX_PER_PAGE } from "@src/constants";
import {
  CollectionData,
  CollectionPermissions,
  HistoryFilters,
  ListHistoryResult,
  ListResult,
} from "@src/types";
import { useEffect, useState } from "react";

export function useCollection(
  bid: string,
  cid: string,
  cacheBust?: number
): CollectionData | undefined {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    setVal(undefined);
    if (!bid || !cid) return;
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
): CollectionPermissions | undefined {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    setVal(undefined);
    if (!bid || !cid) return;
    getClient()
      .bucket(bid)
      .collection(cid)
      .getPermissions()
      .then(result => {
        setVal(result);
      })
      .catch(err => {
        notifyError("Unable to load collection permissions", err);
      });
  }, [bid, cid, cacheBust]);

  return val;
}

export function useCollectionList(
  bid: string,
  cacheBust?: number
): ListResult<CollectionData> | undefined {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    setVal(undefined);
    if (bid) {
      fetchCollections(bid, [], setVal);
    }
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

export function useCollectionHistory(
  bid: string,
  cid: string,
  filters: HistoryFilters,
  cacheBust?: number
): ListHistoryResult {
  const [val, setVal] = useState({});

  const serverInfo = useServerInfo();
  // Turn the HistoryFilters into server filters.
  const serverFilters: Record<string, string> = {
    resource_name: filters.resource_name,
    "gt_target.data.last_modified": filters.since,
  };
  if (filters.exclude_user_id) {
    serverFilters.exclude_user_id = filters.exclude_user_id;
  }
  if (filters.show_signer_plugin === false) {
    const pluginUserId =
      serverInfo.capabilities.signer.plugin_user_id ?? "plugin:remote-settings";
    serverFilters.exclude_user_id = serverFilters.exclude_user_id
      ? `${serverFilters.exclude_user_id},${pluginUserId}`
      : pluginUserId;
  }
  if (
    filters.show_non_humans === false &&
    "openid" in serverInfo.capabilities
  ) {
    // Human authType is openid for now. Become smart when needed.
    const authType = serverInfo.capabilities.openid.providers[0].name;
    serverFilters.like_user_id = `${authType}:*`;
  }

  useEffect(() => {
    setVal({});
    fetchHistory(bid, cid, serverFilters, [], setVal);
  }, [bid, cid, ...Object.values(filters), cacheBust]);

  return val;
}

async function fetchHistory(
  bid: string,
  cid: string,
  filters: Record<string, string>,
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
            ...filters,
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
        fetchHistory(bid, cid, filters, data, setVal, result.next);
      }
    },
  });
}
