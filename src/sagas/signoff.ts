import * as collectionActions from "@src/actions/collection";
import * as SignoffActions from "@src/actions/signoff";
import { getClient } from "@src/client";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import type {
  ActionType,
  BucketResource,
  ChangesList,
  CollectionResource,
  GetStateFn,
  SagaGen,
  ServerInfo,
} from "@src/types";
import { call, put } from "redux-saga/effects";

type CapabilityResource = {
  bucket: string;
  collection: string;
};

type SignerResource = {
  source: CapabilityResource;
  preview?: CapabilityResource;
  destination: CapabilityResource;
  editors_group: string;
  reviewers_group: string;
};

function assertResourceId(
  resource: BucketResource | CollectionResource
): string {
  const {
    data: { id: id },
  } = resource;
  if (!id) {
    throw new Error("Inconsistent state.");
  }
  return id;
}

export function* onCollectionRecordsRequest(
  getState: GetStateFn,
  action: ActionType<typeof collectionActions.listRecords>
): SagaGen {
  try {
    const { bid, cid } = action;
    const {
      session: { serverInfo },
    } = getState();
    // See if currently viewed collection is among kinto-remote-settings signer
    // resources described in server info capabilities.
    const resource = _pickSignoffResource(serverInfo, bid, cid);

    // Current collection is not configured, no need to proceed.
    if (!resource) {
      yield put(SignoffActions.workflowInfo(null));
      return;
    }

    const { source, preview, destination, editors_group, reviewers_group } =
      resource;

    // Show basic infos for this collection while fetching more details.
    const basicInfos = {
      source: { bid: source.bucket, cid: source.collection },
      destination: { bid: destination.bucket, cid: destination.collection },
      preview: preview
        ? { bid: preview.bucket, cid: preview.collection }
        : null,
    };
    yield put(SignoffActions.workflowInfo(basicInfos));

    // Obtain information for workflow (last update, authors, etc).
    const sourceAttributes = yield call(fetchSourceAttributes, source);

    // Workflow component state.

    const {
      status,
      last_edit_by: lastEditBy,
      last_edit_date: nLastEditDate,
      last_review_request_by: lastReviewRequestBy,
      last_review_request_date: nLastReviewRequestDate,
      last_editor_comment: lastEditorComment,
      last_review_by: lastReviewBy,
      last_review_date: nLastReviewDate,
      last_reviewer_comment: lastReviewerComment,
      last_signature_by: lastSignatureBy,
      last_signature_date: nLastSignatureDate,
    } = sourceAttributes;
    const lastEditDate = Date.parse(nLastEditDate);
    const lastReviewRequestDate = Date.parse(nLastReviewRequestDate);
    const lastReviewDate = Date.parse(nLastReviewDate);
    const lastSignatureDate = Date.parse(nLastSignatureDate);

    const sourceInfo = {
      bid: source.bucket,
      cid: source.collection,
      lastEditBy,
      lastEditDate,
      lastEditorComment,
      lastReviewRequestBy,
      lastReviewRequestDate,
      lastReviewBy,
      lastReviewDate,
      lastReviewerComment,
      lastSignatureBy,
      lastSignatureDate,
      status,
      editors_group,
      reviewers_group,
    };
    const collectionsInfo = {
      ...basicInfos,
      source: sourceInfo,
    };
    yield put(SignoffActions.workflowInfo(collectionsInfo));

    // If no preview collection / no review enabled: do not fetch changes.
    if (!preview) {
      // Note that we don't really have to support collections with preview disabled UI.
      // The collections with review disabled are very likely to be manipulated by scripts anyway.
      return;
    }

    let changesOnSource = null;
    let changesOnPreview = null;

    // Figure out what was changed on the source collection since review request.
    // There can be changes on source only if status is work-in-progress.
    if (sourceAttributes.status == "work-in-progress") {
      changesOnSource = yield call(fetchChangesInfo, source, preview);
      // Figure out what was changed on the preview collection since last approval.
      // Don't bother fetching changes if current collection is signed (no pending changes).
    } else if (status != "signed") {
      changesOnPreview = yield call(fetchChangesInfo, source, destination);
    } else {
      // Status is signed. No changes to show.
      return;
    }

    const collectionsInfoWithChanges = {
      ...collectionsInfo,
      changesOnSource,
      changesOnPreview,
    };
    yield put(SignoffActions.workflowInfo(collectionsInfoWithChanges));
  } catch (ex) {
    if (ex.data?.code === 401) {
      console.warn(ex);
    } else {
      notifyError("Error received when requesting signoff info from server.");
    }
  }
}

export async function fetchSourceAttributes(
  source: CapabilityResource
): Promise<object> {
  const client = getClient();
  const sourceClient = client
    .bucket(source.bucket)
    .collection(source.collection);
  return sourceClient.getData();
}

export async function fetchChangesInfo(
  source: CapabilityResource,
  other: CapabilityResource
): Promise<ChangesList> {
  const client = getClient();

  // We get the records timetamp, because it's only bumped when records are changed,
  // unlike the metadata timestamp which is bumped on signature refresh.
  let sinceETag = await client
    .bucket(other.bucket)
    .collection(other.collection)
    .getRecordsTimestamp();

  if (!sinceETag) {
    const data = await client
      .bucket(other.bucket)
      .collection(other.collection)
      .getData<{ last_modified: number }>();
    sinceETag = `${data.last_modified}`;
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

export function* handleRequestReview(
  getState: GetStateFn,
  action: ActionType<typeof SignoffActions.requestReview>
): SagaGen {
  const { bucket } = getState();
  const { comment } = action;
  try {
    const collection = yield call(_updateCollectionAttributes, getState, {
      status: "to-review",
      last_editor_comment: comment,
    });
    const bid = assertResourceId(bucket);
    const {
      data: { id: cid },
    } = collection;
    // Go through the same saga as page load to refresh attributes after signoff changes.
    yield call(
      onCollectionRecordsRequest,
      getState,
      collectionActions.listRecords(bid, cid)
    );
    yield put(
      routeLoadSuccess({
        bucket,
        collection,
        groups: [],
        group: null,
        record: null,
      })
    );
    notifySuccess("Review requested.");
  } catch (e) {
    notifyError("Couldn't request review.", e);
  }
}

export function* handleRollbackChanges(
  getState: GetStateFn,
  action: ActionType<typeof SignoffActions.rollbackChanges>
): SagaGen {
  const { bucket } = getState();
  const { comment } = action;
  try {
    const collection = yield call(_updateCollectionAttributes, getState, {
      status: "to-rollback",
      last_editor_comment: comment,
    });
    const bid = assertResourceId(bucket);
    const {
      data: { id: cid },
    } = collection;
    // Go through the same saga as page load to refresh attributes after signoff changes.
    yield call(
      onCollectionRecordsRequest,
      getState,
      collectionActions.listRecords(bid, cid)
    );
    yield put(
      routeLoadSuccess({
        bucket,
        collection,
        groups: [],
        group: null,
        record: null,
      })
    );
    notifySuccess("Changes were rolled back.");
  } catch (e) {
    notifyError("Couldn't rollback changes.", e);
  }
}

export function* handleDeclineChanges(
  getState: GetStateFn,
  action: ActionType<typeof SignoffActions.declineChanges>
): SagaGen {
  const { bucket } = getState();
  const { comment } = action;
  try {
    const collection = yield call(_updateCollectionAttributes, getState, {
      status: "work-in-progress",
      last_reviewer_comment: comment,
    });
    const bid = assertResourceId(bucket);
    const {
      data: { id: cid },
    } = collection;
    // Go through the same saga as page load to refresh attributes after signoff changes.
    yield call(
      onCollectionRecordsRequest,
      getState,
      collectionActions.listRecords(bid, cid)
    );
    yield put(
      routeLoadSuccess({
        bucket,
        collection,
        groups: [],
        group: null,
        record: null,
      })
    );
    notifySuccess("Changes declined.");
  } catch (e) {
    notifyError("Couldn't decline changes.", e);
  }
}

export function* handleApproveChanges(
  getState: GetStateFn,
  action: ActionType<typeof SignoffActions.approveChanges>
): SagaGen {
  const { bucket } = getState();
  try {
    const collection = yield call(_updateCollectionAttributes, getState, {
      status: "to-sign",
      last_reviewer_comment: "",
    });

    const bid = assertResourceId(bucket);
    const {
      data: { id: cid },
    } = collection;
    // Go through the same saga as page load to refresh attributes after signoff changes.
    yield call(
      onCollectionRecordsRequest,
      getState,
      collectionActions.listRecords(bid, cid)
    );
    yield put(
      routeLoadSuccess({
        bucket,
        collection,
        groups: [],
        group: null,
        record: null,
      })
    );
    notifySuccess("Signature requested.");
  } catch (e) {
    notifyError("Couldn't approve changes.", e);
  }
}

function _updateCollectionAttributes(
  getState: GetStateFn,
  data: {
    status: string;
    last_reviewer_comment?: string;
    last_editor_comment?: string;
  }
): Promise<{ data: { id: string } }> {
  const client = getClient();
  const { bucket, collection } = getState();
  const bid = assertResourceId(bucket);
  const cid = assertResourceId(collection);
  const {
    data: { last_modified },
  } = collection;
  const coll = client.bucket(bid).collection(cid);
  return (
    coll
      .setData(data, { safe: true, patch: true, last_modified })
      .then(() => coll.getData<any>())
      // FIXME: https://github.com/Kinto/kinto-http.js/issues/150
      .then(attributes => ({ data: attributes }))
  );
}

function _pickSignoffResource(
  serverInfo: ServerInfo,
  bid: string,
  cid: string
): SignerResource | null {
  const {
    capabilities: { signer },
  } = serverInfo;
  if (!signer) {
    console.log("kinto-remote-settings signer is not enabled.");
    return null;
  }
  const resources: SignerResource[] = signer.resources;
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
