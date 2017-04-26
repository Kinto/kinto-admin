import { call, put } from "redux-saga/effects";
import { getClient } from "../../client";
import { routeLoadSuccess } from "../../actions/route";
import { notifySuccess, notifyError } from "../../actions/notifications";

import * as SignoffActions from "./actions";

export function* onCollectionRecordsRequest(getState, action) {
  const { bid, cid } = action;
  const { session: { serverInfo } } = getState();
  // See if current collection is among signed resources from capabilities.
  const { capabilities: { signer = { resources: [] } } } = serverInfo;
  const resource = signer.resources.filter(r => {
    return r.source.bucket == bid && r.source.collection == cid;
  })[0];

  // Refresh the signoff toolbar (either empty or basic infos about current)
  yield put(SignoffActions.workflowInfo(resource));

  if (!resource) {
    return;
  }

  // Obtain information for workflow (last update, authors, etc).
  const { source, preview = {}, destination } = resource;
  const {
    sourceAttributes,
    previewAttributes,
    destinationAttributes,
    changes,
  } = yield call(fetchWorkflowInfo, source, preview, destination);

  // Workflow component state.
  const {
    status,
    last_author: lastAuthor,
    last_editor: lastEditor,
    last_editor_comment: lastEditorComment,
    last_reviewer: lastReviewer,
    last_reviewer_comment: lastReviewerComment,
  } = sourceAttributes;

  const sourceInfo = {
    bid: source.bucket,
    cid: source.collection,
    lastAuthor,
    lastEditor,
    lastEditorComment,
    lastReviewer,
    lastReviewerComment,
    status,
    lastStatusChanged: sourceAttributes.last_modified,
    changes,
  };
  const previewInfo = {
    bid: preview.bucket,
    cid: preview.collection,
    lastRequested: previewAttributes.last_modified,
  };
  const destinationInfo = {
    bid: destination.bucket,
    cid: destination.collection,
    lastSigned: destinationAttributes.last_modified,
  };
  yield put(
    SignoffActions.workflowInfo({
      source: sourceInfo,
      preview: previewInfo,
      destination: destinationInfo,
    })
  );
}

function* fetchWorkflowInfo(source, preview, destination) {
  // Obtain collections attributes for source, preview and destination.
  const client = getClient();
  const fetchInfos = batch => {
    batch.bucket(source.bucket).collection(source.collection).getData();
    batch.bucket(preview.bucket).collection(preview.collection).getData();
    batch
      .bucket(destination.bucket)
      .collection(destination.collection)
      .getData();
  };
  const resp = yield call([client, client.batch], fetchInfos);
  // Extract the `data` attribute from each response body, and defaults to
  // empty {} if missing (eg. if preview or destination don't exist yet).
  const respData = resp.map(({ status, body: { data = {} } }, index) => data);
  const [sourceAttributes, previewAttributes, destinationAttributes] = respData;
  // Fetch the source changes made since the last signature (since=0 means everything).
  const lastSigned = String(destinationAttributes.last_modified || 0);
  const { bucket: bid, collection: cid } = source;
  const colClient = client.bucket(bid).collection(cid);
  const { data: sourceChanges } = yield call(
    [colClient, colClient.listRecords],
    { since: lastSigned }
  );
  // Here, `lastUpdated` gives us the timestamp of the most recently changed record.
  // Which can be different from `sourceAttributes.last_modified` since the collection
  // attributes can be changed independently from the records.
  let lastUpdated;
  if (sourceChanges.length > 0) {
    // Some changes exist. Easy, take latest timestamp.
    lastUpdated = sourceChanges[0].last_modified;
  } else {
    // Empty changes list: either never signed, or not changed since last signature.
    lastUpdated = lastSigned === "0" ? null : sourceAttributes.last_modified;
  }
  const changes = {
    since: lastSigned,
    lastUpdated,
    deleted: sourceChanges.filter(r => r.deleted).length,
    updated: sourceChanges.filter(r => !r.deleted).length,
  };
  return {
    sourceAttributes,
    previewAttributes,
    destinationAttributes,
    changes,
  };
}

export function* handleRequestReview(getState, action) {
  const { bucket } = getState();
  const { comment } = action;
  try {
    const collection = yield call(_updateCollectionAttributes, getState, {
      status: "to-review",
      last_editor_comment: comment,
    });
    const { data: { id: bid } } = bucket;
    const { data: { id: cid } } = collection;
    // Go through the same saga as page load to refresh attributes after signoff changes.
    yield call(onCollectionRecordsRequest, getState, { bid, cid });
    yield put(routeLoadSuccess({ bucket, collection }));
    yield put(notifySuccess("Review requested."));
  } catch (e) {
    yield put(notifyError("Couldn't request review.", e));
  }
}

export function* handleDeclineChanges(getState, action) {
  const { bucket } = getState();
  const { comment } = action;
  try {
    const collection = yield call(_updateCollectionAttributes, getState, {
      status: "work-in-progress",
      last_reviewer_comment: comment,
    });
    const { data: { id: bid } } = bucket;
    const { data: { id: cid } } = collection;
    // Go through the same saga as page load to refresh attributes after signoff changes.
    yield call(onCollectionRecordsRequest, getState, { bid, cid });
    yield put(routeLoadSuccess({ bucket, collection }));
    yield put(notifySuccess("Changes declined."));
  } catch (e) {
    yield put(notifyError("Couldn't decline changes.", e));
  }
}

export function* handleApproveChanges(getState, action) {
  const { bucket } = getState();
  try {
    const collection = yield call(_updateCollectionAttributes, getState, {
      status: "to-sign",
      last_reviewer_comment: "",
    });

    const { data: { id: bid } } = bucket;
    const { data: { id: cid } } = collection;
    // Go through the same saga as page load to refresh attributes after signoff changes.
    yield call(onCollectionRecordsRequest, getState, { bid, cid });
    yield put(routeLoadSuccess({ bucket, collection }));
    yield put(notifySuccess("Signature requested."));
  } catch (e) {
    yield put(notifyError("Couldn't approve changes.", e));
  }
}

function _updateCollectionAttributes(getState, data) {
  const client = getClient();
  const {
    bucket: { data: { id: bid } },
    collection: { data: { id: cid, last_modified } },
  } = getState();
  const coll = client.bucket(bid).collection(cid);
  return (
    coll
      .setData(data, { safe: true, patch: true, last_modified })
      .then(() => coll.getData())
      // FIXME: https://github.com/Kinto/kinto-http.js/issues/150
      .then(attributes => ({ data: attributes }))
  );
}
