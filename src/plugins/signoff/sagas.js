import { call, put } from "redux-saga/effects";
import { getClient } from "../../client";
import { routeLoadSuccess } from "../../actions/route";
import { notifySuccess, notifyError } from "../../actions/notifications";

import * as SignoffActions from "./actions";

export function* onCollectionRecordsRequest(getState, action) {
  const { bid, cid } = action;
  const {
    session: { serverInfo },
  } = getState();
  // See if currently viewed collection is among kinto-signer resources
  // described in server info capabilities.
  const resource = _pickSignoffResource(serverInfo, bid, cid);

  // Current collection is not configured, no need to proceed.
  if (!resource) {
    yield put(SignoffActions.workflowInfo(null));
    return;
  }

  const {
    source,
    preview = {},
    destination,
    editors_group,
    reviewers_group,
  } = resource;

  // Show basic infos for this collection while fetching more details.
  const basicInfos = {
    source: { bid: source.bucket, cid: source.collection },
    destination: { bid: destination.bucket, cid: destination.collection },
    preview: { bid: preview.bucket, cid: preview.collection },
  };
  yield put(SignoffActions.workflowInfo(basicInfos));

  // Obtain information for workflow (last update, authors, etc).
  const {
    sourceAttributes,
    changes,
  } = yield call(fetchWorkflowInfo, source, preview, destination);

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
    changes,
    editors_group,
    reviewers_group,
  };
  const collectionsInfo = {
    ...basicInfos,
    source: sourceInfo,
  };
  yield put(SignoffActions.workflowInfo(collectionsInfo));
}

export async function fetchWorkflowInfo(source, preview, destination) {
  const client = getClient();
  const { bucket: bid, collection: cid } = source;
  const colClient = client.bucket(bid).collection(cid);

  const sourceAttributes = await colClient.getData();
  const lastSigned = Date.parse(sourceAttributes.last_signature_date);
  const { data: sourceChanges } = await colClient.listRecords({ since: lastSigned });
  const changes = {
    since: lastSigned,
    deleted: sourceChanges.filter(r => r.deleted).length,
    updated: sourceChanges.filter(r => !r.deleted).length,
  };
  return {
    sourceAttributes,
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
    const {
      data: { id: bid },
    } = bucket;
    const {
      data: { id: cid },
    } = collection;
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
    const {
      data: { id: bid },
    } = bucket;
    const {
      data: { id: cid },
    } = collection;
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

    const {
      data: { id: bid },
    } = bucket;
    const {
      data: { id: cid },
    } = collection;
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
    bucket: {
      data: { id: bid },
    },
    collection: {
      data: { id: cid, last_modified },
    },
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

function _pickSignoffResource(serverInfo, bid, cid) {
  const {
    capabilities: { signer = { resources: [] } },
  } = serverInfo;
  if (signer.resources.length == 0) {
    console.log("kinto-signer is not enabled.");
  }
  let resource = signer.resources.filter(
    ({ source: { bucket, collection } }) => {
      // If the source has no collection info, it means that reviewing was configured
      // by bucket on the server, and that it applies to every collection (thus this one too).
      return bucket == bid && (!collection || collection == cid);
    }
  )[0];
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
