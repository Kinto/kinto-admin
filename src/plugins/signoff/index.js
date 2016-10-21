import React from "react";
import { takeEvery } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getClient } from "../../client";
import { routeLoadSuccess } from "../../actions/route";
import { notifySuccess, notifyError } from "../../actions/notifications";
import { canEditCollection } from "../../permission";
import { ProgressBar, ProgressStep } from "./ProgressBar.js";
import * as constants from "../../constants";
import { timeago, humanDate } from "../../utils";
import AdminLink from "../../components/AdminLink";

import "./styles.css";

//
// Constants
//

const PLUGIN_REVIEW_REQUEST = "PLUGIN_REVIEW_REQUEST";
const PLUGIN_DECLINE_REQUEST = "PLUGIN_DECLINE_REQUEST";
const PLUGIN_SIGNOFF_REQUEST = "PLUGIN_SIGNOFF_REQUEST";
const SIGNOFF_WORKFLOW_INFO = "SIGNOFF_WORKFLOW_INFO";

//
// Actions
//

const SignoffActions = {
  requestReview() {
    return {type: PLUGIN_REVIEW_REQUEST};
  },
  declineChanges() {
    return {type: PLUGIN_DECLINE_REQUEST};
  },
  approveChanges() {
    return {type: PLUGIN_SIGNOFF_REQUEST};
  },
  workflowInfo(info) {
    return {type: SIGNOFF_WORKFLOW_INFO, info};
  }
};

//
// Sagas
//

function _updateCollectionAttributes(getState, data) {
  const client = getClient();
  const {
    bucket: {data: {id: bid}},
    collection: {data: {id: cid, last_modified}}
  } = getState();
  const coll = client.bucket(bid).collection(cid);
  return coll.setData(data, {safe: true, patch: true, last_modified});
}

function *onCollectionRecordsRequest(getState, action) {
  const {bid, cid} = action;
  const {session: {serverInfo}} = getState();
  const {capabilities: {signer={resources: []}}} = serverInfo;
  const resource = signer.resources.filter((r) => {
    return r.source.bucket == bid && r.source.collection == cid;
  })[0];

  yield put(SignoffActions.workflowInfo({resource}));

  if (!resource) {
    return;
  }

  const {source, preview={}, destination} = resource;

  // Obtain collections attributes for source, preview and destination.
  const client = getClient();
  const fetchInfos = (batch) => {
    batch.bucket(source.bucket).collection(source.collection).getData();
    batch.bucket(preview.bucket).collection(preview.collection).getData();
    batch.bucket(destination.bucket).collection(destination.collection).getData();
  };
  const resp = yield call([client, client.batch], fetchInfos);
  // Extract the `data` attribute from each response body, and defaults to
  // empty {} if missing (eg. if preview or destination don't exist yet).
  const respData = resp.map(({status, body: {data={}}}, index) => data);
  const [sourceData, previewData, destinationData] = respData;
  // Fetch the source changes made since the last signature (since=0 means everything).
  const lastSigned = String(destinationData.last_modified || 0);
  const colClient = client.bucket(bid).collection(cid);
  const {data: sourceChanges} = yield call([colClient, colClient.listRecords], {
    since: lastSigned
  });
  // Here, `lastChange` gives us the timestamp of the most recently changed record.
  // Which can be different from `sourceData.last_modified` since the collection
  // attributes can be changed independently from the records.
  const changes = {
    since: lastSigned,
    lastUpdated: sourceChanges[0].last_modified,
    deleted: sourceChanges.filter((r) => r.deleted).length,
    updated: sourceChanges.filter((r) => !r.deleted).length,
  };

  // Workflow component state.
  const {
    status,
    last_author: lastAuthor,
    last_editor: lastEditor,
    last_reviewer: lastReviewer,
  } = sourceData;

  const information = {
    resource: {
      source: {
        bid: source.bucket,
        cid: source.collection,
        lastAuthor,
        lastEditor,
        lastReviewer,
        status,
        lastStatusChanged: sourceData.last_modified,
        changes,
      },
      preview: {
        bid: preview.bucket,
        cid: preview.collection,
        lastRequested: previewData.last_modified,
      },
      destination: {
        bid: destination.bucket,
        cid: destination.collection,
        lastSigned: destinationData.last_modified,
      }
    }
  };
  yield put(SignoffActions.workflowInfo(information));
}

function* handleRequestReview(getState, action) {
  const {bucket} = getState();
  try {
    const collection = yield call([this, _updateCollectionAttributes], getState, {status: "to-review"});
    yield put(routeLoadSuccess({bucket, collection}));
    yield put(notifySuccess("Review requested."));
  } catch(e) {
    yield put(notifyError("Couldn't request review.", e));
  }
}

function* handleDeclineChanges(getState, action) {
  const {bucket} = getState();
  try {
    const collection = yield call([this, _updateCollectionAttributes], getState, {status: "work-in-progress"});
    yield put(routeLoadSuccess({bucket, collection}));
    yield put(notifySuccess("Changes declined."));
  } catch(e) {
    yield put(notifyError("Couldn't decline changes.", e));
  }
}

function* handleApproveChanges(getState, action) {
  const {bucket} = getState();
  try {
    const collection = yield call([this, _updateCollectionAttributes], getState, {status: "to-sign"});
    yield put(routeLoadSuccess({bucket, collection}));
    yield put(notifySuccess("Signature requested."));
  } catch(e) {
    yield put(notifyError("Couldn't approve changes.", e));
  }
}

export const sagas = [
  [takeEvery, constants.COLLECTION_RECORDS_REQUEST, onCollectionRecordsRequest],
  [takeEvery, PLUGIN_REVIEW_REQUEST, handleRequestReview],
  [takeEvery, PLUGIN_DECLINE_REQUEST, handleDeclineChanges],
  [takeEvery, PLUGIN_SIGNOFF_REQUEST, handleApproveChanges],
];

//
// Reducers
//

const INITIAL_STATE = {
  resource: {
    source: {},
    preview: {},
    destination: {},
  }
};

export const reducers = {
  signoff(state=INITIAL_STATE, action) {
    switch(action.type) {
      case SIGNOFF_WORKFLOW_INFO: {
        const {info: {resource}} = action;
        return {...state, resource};
      }
      default: {
        return state;
      }
    }
  }
};


//
// Components
//

class SignoffToolBar extends React.Component {
  render() {
    const {
      // Global state
      sessionState,
      bucketState,
      collectionState,
      // Plugin state
      signoff={},
      // Actions
      requestReview,
      approveChanges,
      declineChanges} = this.props;

    const canEdit = canEditCollection(sessionState, bucketState, collectionState);

    // The above sagas refresh the global state via `routeLoadSuccess` actions.
    // Use the global so that the toolbar is refreshed when status changes.
    const {data: {status}} = collectionState;

    // Information loaded via this plugin.
    const {resource} = signoff;
    // Hide toolbar if server has not kinto-signer plugin,
    // or if this collection is not configured to be signed.
    if (!resource) {
      return null;
    }

    const {source, preview, destination} = resource;

    // Default status is request review
    const step = {"to-review": 1, "signed": 2}[status] || 0;
    return (
      <ProgressBar>
        <WorkInProgress label="Work in progress"
                        step={0}
                        currentStep={step}
                        canEdit={canEdit}
                        requestReview={requestReview}
                        source={source} />
        <Review label="Waiting review"
                step={1}
                currentStep={step}
                canEdit={canEdit}
                approveChanges={approveChanges}
                declineChanges={declineChanges}
                source={source}
                preview={preview} />
        <Signed label="Signed"
                step={2}
                currentStep={step}
                canEdit={canEdit}
                approveChanges={approveChanges}
                source={source}
                destination={destination} />
      </ProgressBar>
    );
  }
}

function WorkInProgress({label, canEdit, currentStep, step, requestReview, source}) {
  const active = (step == currentStep && canEdit);
  const {lastAuthor, changes={}} = source;
  const {lastUpdated} = changes;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {lastAuthor ?
       <ul>
         <li><strong>Author: </strong> {lastAuthor}</li>
         <li><strong>Updated: </strong><span title={humanDate(lastUpdated)}>{timeago(lastUpdated)}</span></li>
       </ul> : null}
      {active ?
       <button className="btn btn-info"
               onClick={requestReview}>
        <i className="glyphicon glyphicon-comment"></i> Request review
       </button> : null}
    </ProgressStep>
  );
}

function Review({label, canEdit, currentStep, step, approveChanges, declineChanges, source, preview}) {
  const active = (step == currentStep && canEdit);

  // If preview disabled, the preview object is empty.
  // We use the source last status change as review request datetime.
  let link = "disabled";
  let {lastStatusChanged: lastRequested} = source;
  if (preview.bid && preview.cid) {
    lastRequested = preview.lastRequested;
    const {bid, cid} = preview;
    link = <AdminLink name="collection:records" params={{bid, cid}}>{`${bid}/${cid}`}</AdminLink>;
  }

  const {bid, cid, lastEditor, changes={}} = source;
  const {since, deleted, updated} = changes;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {lastEditor ?
       <ul>
         <li><strong>Editor: </strong> {lastEditor}</li>
         <li><strong>Requested: </strong><span title={humanDate(lastRequested)}>{timeago(lastRequested)}</span></li>
         <li><strong>Preview: </strong> {link}</li>
         {active ?
          <li>
            <strong>Changes: </strong>
            <DiffStats updated={updated} deleted={deleted}/>{" "}
            <AdminLink name="collection:history"
                       params={{bid, cid}}
                       query={{since, resource_name: "record"}}>details...</AdminLink>
          </li> : null}
       </ul> : null}
      {active ?
       <div className="btn-group">
         <button className="btn btn-success"
                 onClick={approveChanges}>
           <i className="glyphicon glyphicon-ok"></i> Approve
         </button>
         <button className="btn btn-danger"
                 onClick={declineChanges}>
           <i className="glyphicon glyphicon-remove"></i> Decline
         </button>
       </div> : null}
    </ProgressStep>
  );
}

function DiffStats({updated, deleted}) {
  return (
    <span className="diffstats">
      {updated > 0 ? <span className="text-green">+{updated}</span> : null}
      {deleted > 0 ? <span className="text-red">-{deleted}</span> : null}
    </span>
  );
}

function Signed({label, canEdit, currentStep, step, approveChanges, source, destination}) {
  const active = (step == currentStep && canEdit);
  const {lastReviewer} = source;
  const {lastSigned, bid, cid} = destination;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {lastSigned ?
       <ul>
         <li><strong>Reviewer: </strong>{lastReviewer}</li>
         <li><strong>Signed: </strong><span title={humanDate(lastSigned)}>{timeago(lastSigned)}</span></li>
         <li>
           <strong>Destination: </strong>
           <AdminLink name="collection:records" params={{bid, cid}}>{`${bid}/${cid}`}</AdminLink>
         </li>
      </ul> : null}
      {active ?
       <button className="btn btn-info"
               onClick={approveChanges}>
         <i className="glyphicon glyphicon-repeat"></i> Re-sign
       </button> : null}
    </ProgressStep>
  );
}


//
// Container
//

function mapStateToProps(state) {
  const {
    session: sessionState,
    bucket: bucketState,
    collection: collectionState,
    signoff} = state;
  return {
    sessionState,
    bucketState,
    collectionState,
    signoff
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SignoffActions, dispatch);
}

const SignoffContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignoffToolBar);


//
// Plugin register
//

export function register(store) {
  const hooks = {
    CollectionRecords: {
      ListActions: [
        <SignoffContainer key="request-signoff-toolbar" />
      ]
    }
  };

  return {
    hooks,
  };
}
