import * as SignoffActions from "@src/actions/signoff";
import { getClient } from "@src/client";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import type {
  ActionType,
  BucketResource,
  CollectionResource,
  GetStateFn,
  SagaGen,
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
