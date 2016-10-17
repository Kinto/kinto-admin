import React from "react";
import { Link } from "react-router";
import { takeEvery } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getClient } from "../../client";
import { routeLoadSuccess } from "../../actions/route";
import { notifySuccess, notifyError } from "../../actions/notifications";
import ProgressBar from "./ProgressBar.js";
import * as constants from "../../constants";

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
  workflowInfo(answer) {
    return {type: SIGNOFF_WORKFLOW_INFO, answer};
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
  // XXX if not in capabilities return;
  const client = getClient();
  const results = yield call([client, client.listBuckets]);
  yield put(SignoffActions.workflowInfo(results.data.length));
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

const INITIAL_STATE = {};

export const reducers = {
  signoff(state=INITIAL_STATE, action) {
    switch(action.type) {
      case SIGNOFF_WORKFLOW_INFO: {
        return {...state, answer: action.answer};
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
      collectionState,
      bucketState,
      sessionState,
      // Plugin state
      signoff,
      // Actions
      requestReview,
      approveChanges,
      declineChanges} = this.props;

    const {serverInfo} = sessionState;
    const {data: {id: bid}} = bucketState;
    const {data: {
      id: cid,
      status,
      last_author,
      last_editor,
      last_reviewer
    }} = collectionState;

    // Hide toolbar if server has not kinto-signer plugin.
    const capability = serverInfo.capabilities.signer;
    if (!capability) {
      return null;
    }

    const currentResource = capability.resources.filter((r) => {
      return r.source.bucket == bid && r.source.collection == cid;
    })[0];
    // Hide toolbar if this collection is not configured to be signed.
    if (!currentResource) {
      return null;
    }

    const {preview} = currentResource;

    // Default status is request review
    const step = {"to-review": 1, "signed": 2}[status] || 0;
    const steps = [{
      label: "Work in progress",
      details: <WorkInProgress active={step === 0}
                               requestReview={requestReview}
                               last_author={last_author} />
    }, {
      label: "Waiting review",
      details: <Review active={step === 1}
                       preview={preview}
                       approveChanges={approveChanges}
                       declineChanges={declineChanges}
                       last_editor={last_editor} />
    }, {
      label: "Signed",
      details: <Signed active={step === 2}
                       approveChanges={approveChanges}
                       last_reviewer={last_reviewer} />
    }];
    return <ProgressBar active={step} steps={steps}/>;
  }
}

function WorkInProgress({active, requestReview, last_author}) {
  return (
    <div>
      <ul>
        <li><strong>Author: </strong> {last_author}</li>
      </ul>
      {active ?
       <button className="btn btn-info"
               onClick={requestReview}>
        <i className="glyphicon glyphicon-comment"></i> Request review
       </button> : null}
    </div>
  );
}

function Review({active, preview, approveChanges, declineChanges, last_editor}) {
  let link = "Preview disabled";
  if (preview) {
    const previewURL = `/buckets/${preview.bucket}/collections/${preview.collection}/records`;
    link = <Link to={previewURL}>{previewURL}</Link>;
  }
  return (
    <div>
      <ul>
        <li><strong>Editor: </strong> {last_editor}</li>
        <li><strong>Preview URL: </strong> {link}</li>
      </ul>
      {active ?
       <span>
         <button className="btn btn-success"
                 onClick={approveChanges}>
           <i className="glyphicon glyphicon-ok"></i> Approve
         </button>
         <button className="btn btn-danger"
                 onClick={declineChanges}>
           <i className="glyphicon glyphicon-remove"></i> Decline
         </button>
       </span> : null}
    </div>
  );
}

function Signed({active, approveChanges, last_reviewer}) {
  return (
    <div>
      <ul>
        <li><strong>Reviewer: </strong>{last_reviewer}</li>
      </ul>
      {active ?
       <button className="btn btn-info"
               onClick={approveChanges}>
         <i className="glyphicon glyphicon-repeat"></i> Re-sign
       </button> : null}
    </div>
  );
}


//
// Container
//

function mapStateToProps(state) {
  const {
    collection: collectionState,
    bucket: bucketState,
    session: sessionState,
    signoff
  } = state;
  return {
    collectionState,
    bucketState,
    sessionState,
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
