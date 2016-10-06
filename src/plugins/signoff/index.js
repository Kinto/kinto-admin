import React from "react";
import { Link } from "react-router";
import { takeEvery } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { push as updatePath } from "react-router-redux";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getClient } from "../../client";
import { notifySuccess, notifyError } from "../../actions/notifications";
import ProgressBar from "./ProgressBar.js";
import * as constants from "../../constants";


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
}

//
// Sagas
//

function *onCollectionRecordsRequest(getState, action) {
  // XXX if not in capabilities return;
  const client = getClient();
  const results = yield call([client, client.listBuckets]);
  yield put(SignoffActions.workflowInfo(results.data.length));
}

function* handleSignoffRequest(getState, action) {
  // Obtain current bucket and collection ids from state.
  const {bucket: bucketState, collection: collectionState} = getState();
  const {type} = action;
  const {id: bid} = bucketState;
  const {id: cid} = collectionState;

  let status;
  let message;
  switch (type) {
    case PLUGIN_SIGNOFF_REQUEST:
      status = {status: "to-sign"};
      message = "Signature requested.";
      break;
    case PLUGIN_DECLINE_REQUEST:
      status = {status: "work-in-progress"};
      message = "Changes declined.";
      break;
    case PLUGIN_REVIEW_REQUEST:
      status = {status: "to-review"};
      message = "Review requested.";
      break;
  }

  const client = getClient();
  const coll = client.bucket(bid).collection(cid);
  const {last_modified} = collectionState.data;
  try {
    yield call([coll, coll.setData], status, {
      safe: true,
      patch: true,
      last_modified
    });
    // XXX: do not refresh the page, dispatch action?
    yield put(updatePath(`/buckets/${bid}/collections/${cid}/records`));
    yield put(notifySuccess(message));
  } catch (e) {
    yield put(notifyError("Couldn't change collection status.", e));
  }
}

export const sagas = [
  [takeEvery, constants.COLLECTION_RECORDS_REQUEST, onCollectionRecordsRequest],
  [takeEvery, PLUGIN_REVIEW_REQUEST, handleSignoffRequest],
  [takeEvery, PLUGIN_DECLINE_REQUEST, handleSignoffRequest],
  [takeEvery, PLUGIN_SIGNOFF_REQUEST, handleSignoffRequest],
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

class SignoffButton extends React.Component {
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
    const {id: bid} = bucketState;
    const {id: cid} = collectionState;

    // Hide button if server has not kinto-signer plugin.
    const capability = serverInfo.capabilities.signer;
    if (!capability) {
      return null;
    }

    const currentResource = capability.resources.filter((r) => {
      return r.source.bucket == bid && r.source.collection == cid;
    })[0];

    // Hide button if this collection is not configured to be signed.
    if (!currentResource) {
      return null;
    }

    const {preview} = currentResource;

    const {
      status,
      last_author,
      last_editor,
      last_reviewer } = collectionState.data;

    // Default to request review
    let step = 0;
    if (status === "to-review") {
      step = 1;
    } else if (status === "signed") {
      step = 2;
    }

    const wipDetails = (
      <div>
        <ul>
          <li><strong>Author: </strong> {last_author}</li>
          <li><strong>Prout: </strong> {signoff.answer}</li>
        </ul>
        <button className="btn btn-info"
                onClick={requestReview}>
          <i className="glyphicon glyphicon-comment"></i> Request review
        </button>
      </div>
    );

    let link = null;
    if (preview) {
      const previewURL = `/buckets/${preview.bucket}/collections/${preview.collection}/records`;
      link = <Link to={previewURL}>{previewURL}</Link>;
    }
    const reviewDetails = (
      <div>
        <ul>
          <li><strong>Editor: </strong> {last_editor}</li>
          <li><strong>Preview URL: </strong> {link || "Preview disabled"}</li>
        </ul>
        <span>
          <button className="btn btn-success"
                  onClick={approveChanges}>
            <i className="glyphicon glyphicon-ok"></i> Approve
          </button>
          <button className="btn btn-danger"
                  onClick={declineChanges}>
            <i className="glyphicon glyphicon-remove"></i> Decline
          </button>
        </span>
      </div>
    );

    const signedDetails = (
      <div>
        <ul>
          <li><strong>Reviewer: </strong>{last_reviewer}</li>
        </ul>
        <button className="btn btn-info"
                onClick={approveChanges}>
          <i className="glyphicon glyphicon-repeat"></i> Re-sign
        </button>
      </div>
    );

    const steps = [
      {label: "Work in progress", details: wipDetails},
      {label: "Waiting review", details: reviewDetails},
      {label: "Signed", details: signedDetails},
    ];

    return <ProgressBar active={step} steps={steps}/>;
  }
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
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SignoffActions, dispatch);
}

const SignoffContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignoffButton);


//
// Plugin register
//

export function register(store) {
  const hooks = {
    CollectionRecords: {
      ListActions: [
        <SignoffContainer key="request-signoff-btn" />
      ]
    }
  };

  return {
    hooks,
  };
}
