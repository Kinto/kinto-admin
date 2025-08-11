import { notifyError } from "./notifications";
import { useServerInfo } from "./session";
import { getClient } from "@src/client";
import { DEFAULT_SORT, MAX_PER_PAGE } from "@src/constants";
import {
  BucketData,
  BucketEntry,
  BucketPermissions,
  HistoryFilters,
  ListHistoryResult,
  PermissionsListEntry,
} from "@src/types";
import { historyFiltersToServerFilters, makeObservable } from "@src/utils";
import { useEffect, useState } from "react";

export function useBucket(
  bid: string,
  cacheBust?: number
): BucketData | undefined {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    setVal(undefined);
    if (!bid) return;
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

const bucketListCacheVal = makeObservable(0);

export function reloadBuckets() {
  bucketListCacheVal.set(bucketListCacheVal.get() + 1);
}

export function useBucketList(
  permissions?: PermissionsListEntry[],
  userBucket?: string
): BucketEntry[] | undefined {
  const [cacheVal, setCacheVal] = useState(0);
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    setVal(undefined);
    fetchBuckets(permissions, userBucket, setVal);
    return bucketListCacheVal.subscribe(setCacheVal);
  }, [permissions !== undefined, userBucket, cacheVal]);

  return val;
}

async function fetchBuckets(permissions, userBucket, setVal) {
  const client = getClient();

  try {
    const bucketData = (await client.listBuckets()).data;
    const collectionData = await client.batch(batch => {
      for (const { id } of bucketData) {
        batch.bucket(id == userBucket ? "default" : id).listCollections();
      }
    });

    // BucketEntry[]
    const buckets = bucketData.map((bucket, index) => {
      // Initialize received collections with default permissions and readonly
      // information.
      const { data: rawCollections } = collectionData[index].body;
      const collections = rawCollections.map(collection => {
        return {
          ...collection,
          permissions: [],
          readonly: true,
        };
      });
      // Initialize the list of permissions and readonly flag for this bucket;
      // when the permissions endpoint is enabled, we'll fill these with the
      // retrieved data.
      return {
        ...bucket,
        collections,
        permissions: [],
        readonly: true,
        canCreateCollection: true,
      };
    });

    if (permissions) {
      expandBucketsCollections(buckets, permissions);
    }

    setVal(buckets);
  } catch (ex) {
    notifyError("Unable to load buckets", ex);
  }
}

export function useBucketPermissions(
  bid: string,
  cacheBust?: number
): BucketPermissions | undefined {
  const [val, setVal] = useState(undefined);

  useEffect(() => {
    setVal(undefined);
    if (!bid) return;
    getClient()
      .bucket(bid)
      .getPermissions()
      .then(result => {
        setVal(result);
      })
      .catch(err => {
        notifyError("Unable to load bucket permissions", err);
      });
  }, [bid, cacheBust]);

  return val;
}

export function useBucketHistory(
  bid: string,
  filters: HistoryFilters,
  cacheBust?: number
): ListHistoryResult {
  const [val, setVal] = useState({});
  const serverInfo = useServerInfo();
  const serverFilters = historyFiltersToServerFilters(serverInfo, filters);

  useEffect(() => {
    setVal({});
    fetchHistory(bid, serverFilters, [], setVal);
  }, [bid, ...Object.values(filters), cacheBust]);

  return val;
}

async function fetchHistory(
  bid: string,
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
          sort: DEFAULT_SORT,
          filters: {
            ...filters,
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
        fetchHistory(bid, filters, data, setVal, result.next);
      }
    },
  });
}

export function expandBucketsCollections(buckets, permissions): BucketEntry[] {
  // Augment the list of bucket and collections with the ones retrieved from
  // the /permissions endpoint
  for (const permission of permissions) {
    if (!Object.prototype.hasOwnProperty.call(permission, "bucket_id")) {
      // e.g. { resource_name: "root" } permission.
      continue;
    }
    // Add any missing bucket to the current list
    let bucket = buckets.find(b => b.id === permission.bucket_id);
    if (!bucket) {
      bucket = {
        id: permission.bucket_id,
        collections: [],
        permissions: [],
        readonly: true,
        canCreateCollection: true,
      };
      buckets.push(bucket);
    }
    // We're dealing with bucket permissions
    if (permission.resource_name === "bucket") {
      bucket.permissions = permission.permissions;
      bucket.readonly = !bucket.permissions.some(bp => {
        return ["write", "collection:create"].includes(bp);
      });
      bucket.canCreateCollection =
        bucket.permissions.includes("collection:create");
    }
    if ("collection_id" in permission) {
      // Add any missing collection to the current bucket collections list; note
      // that this will expose collections we have shared records within too.
      let collection = bucket.collections.find(
        c => c.id === permission.collection_id
      );
      if (!collection) {
        collection = {
          id: permission.collection_id,
          permissions: [],
          readonly: true,
        };
        bucket.collections.push(collection);
      }
      // We're dealing with collection permissions
      if (permission.resource_name === "collection") {
        collection.permissions = permission.permissions;
        collection.readonly = !collection.permissions.some(cp => {
          return ["write", "record:create"].includes(cp);
        });
      }
    }
  }
  return buckets;
}
