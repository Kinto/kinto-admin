import { getClient } from "@src/client";
import type {
  ChangesList,
  SignedCollectionData,
  SignerCapabilityResource,
  SignerCapabilityResourceEntry,
  SignoffCollectionStatus,
  SignoffCollectionsInfo,
} from "@src/types";
import { useEffect, useState } from "react";

export function useSignoff(
  bid: string,
  cid: string,
  signer: any,
  cacheBust?: number
): SignerCapabilityResource | SignoffCollectionsInfo {
  const resource = _pickSignoffResource(signer, bid, cid);
  const [val, setVal] = useState(null);

  useEffect(() => {
    setVal(resource); // `null` or `SignerCapabilityResource`
    if (resource && resource.source) {
      calculateChangesInfo(resource).then((infos: SignoffCollectionsInfo) =>
        setVal(infos)
      );
    }
  }, [resource?.source?.bucket, resource?.source?.collection, cacheBust]);

  return val;
}

async function calculateChangesInfo(
  resource: SignerCapabilityResource
): Promise<SignoffCollectionsInfo> {
  const collection: SignedCollectionData = await getClient()
    .bucket(resource.source.bucket)
    .collection(resource.source.collection)
    .getData();

  let changesOnSource = null;
  let changesOnPreview = null;

  if (collection.status === "work-in-progress") {
    changesOnSource = await fetchChangesInfo(
      resource.source,
      resource.preview,
      collection.last_modified
    );
  } else if (collection.status !== "signed") {
    changesOnPreview = await fetchChangesInfo(
      resource.source,
      resource.destination,
      collection.last_modified
    );
  }
  return {
    ...resource,
    source: {
      ...resource.source,
      status: collection.status as SignoffCollectionStatus,
      lastEditBy: collection.last_edit_by,
      lastEditDate: new Date(collection.last_edit_date).getTime() || null,
      lastEditorComment: collection.last_editor_comment,
      lastReviewBy: collection.last_review_by,
      lastReviewDate: new Date(collection.last_review_date).getTime() || null,
      lastReviewRequestBy: collection.last_review_request_by,
      lastReviewRequestDate:
        new Date(collection.last_review_request_date).getTime() || null,
      lastReviewerComment: collection.last_reviewer_comment,
      lastSignatureBy: collection.last_signature_by,
      lastSignatureDate:
        new Date(collection.last_signature_date).getTime() || null,
    },
    changesOnPreview,
    changesOnSource,
  };
}

function _pickSignoffResource(
  signer: any,
  bid: string,
  cid: string
): SignerCapabilityResource | null {
  if (!signer) {
    console.log("kinto-remote-settings signer is not enabled.");
    return null;
  }
  const resources = signer.resources;
  let resource = resources.filter(({ source, preview, destination }) => {
    // If the resource has no collection info, it means that reviewing was configured
    // by bucket on the server, and that it applies to every collection (thus this one too).
    return (
      // We are viewing the source.
      (source.bucket == bid &&
        (!source.collection || source.collection == cid)) ||
      // Preview is enabled and we are viewing it.
      (preview &&
        preview.bucket == bid &&
        (!preview.collection || preview.collection == cid)) ||
      // We are viewing the destination.
      (destination.bucket == bid &&
        (!destination.collection || destination.collection == cid))
    );
  })[0];
  if (!resource) {
    // No resource matching. Current collection is not concerned with signoff.
    // Return explicit null instead of implicit undefined.
    return null;
  }
  // The whole UI expects to have collection information for source/preview/destination.
  // If configured by bucket, fill-up the missing attribute as if it would be configured
  // explicitly for this collection.
  if (resource && !resource.source.collection) {
    resource = {
      ...resource,
      source: {
        ...resource.source,
        collection: cid,
      },
      destination: {
        ...resource.destination,
        collection: cid,
      },
    };
    if (resource.preview) {
      resource.preview.collection = cid;
    }
  }
  return resource;
}

async function fetchChangesInfo(
  source: SignerCapabilityResourceEntry,
  other: SignerCapabilityResourceEntry,
  collectionLastModified: number
): Promise<ChangesList> {
  const client = getClient();

  // We get the records timetamp, because it's only bumped when records are changed,
  // unlike the metadata timestamp which is bumped on signature refresh.
  let sinceETag = await client
    .bucket(other.bucket)
    .collection(other.collection)
    .getRecordsTimestamp();

  if (!sinceETag) {
    sinceETag = `${collectionLastModified}`;
  }

  // Look up changes since ETag.
  const { data: changes } = await client
    .bucket(source.bucket)
    .collection(source.collection)
    .listRecords({
      since: sinceETag,
      fields: ["deleted"], // limit amount of data to fetch.
    });

  const since: number = parseInt(sinceETag.replace('"', ""), 10);
  return {
    since,
    deleted: changes.filter(r => r.deleted).length,
    updated: changes.filter(r => !r.deleted).length,
  };
}
