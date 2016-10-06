import React from "react";
import { Link } from "react-router";
import { takeEvery } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { push as updatePath } from "react-router-redux";

import { getClient } from "../../client";
import { notifySuccess, notifyError } from "../../actions/notifications";
import ProgressBar from "./ProgressBar.js";


const PLUGIN_REVIEW_REQUEST = "PLUGIN_REVIEW_REQUEST";
const PLUGIN_DECLINE_REQUEST = "PLUGIN_DECLINE_REQUEST";
const PLUGIN_SIGNOFF_REQUEST = "PLUGIN_SIGNOFF_REQUEST";

// Actions
function requestReview() {
  return {type: PLUGIN_REVIEW_REQUEST};
}
function declineChanges() {
  return {type: PLUGIN_DECLINE_REQUEST};
}
function approveChanges() {
  return {type: PLUGIN_SIGNOFF_REQUEST};
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
    yield put(updatePath(`/buckets/${bid}/collections/${cid}/records`));
    yield put(notifySuccess(message));
  } catch (e) {
    yield put(notifyError("Couldn't change collection status.", e));
  }
}


class SignoffButton extends React.Component {
  render() {
    const {getState, dispatch} = this.props;
    const {collection: collectionState, bucket: bucketState, session: sessionState} = getState();
    const {serverInfo} = sessionState;
    const {id: bid} = bucketState;
    const {id: cid} = collectionState;

    // Hide button if server does not support signoff.
    const capability = serverInfo.capabilities.signer;
    if (!capability) {
      return null;
    }

    const current_resource = capability.resources.filter((r) => r.source.bucket == bid && r.source.collection == cid);

    // Hide button if this collection is not configured to be signed.
    if (current_resource.length === 0) {
      return null;
    }

    const preview = current_resource[0].preview;

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

    const wip_details = (
      <div>
        <ul>
          <li><strong>Author: </strong> {last_author}</li>
        </ul>
        <a className="btn btn-info"
           href="#"
           onClick={(event) => {
             event.preventDefault();
             dispatch(requestReview());
           }}>Request review</a>
      </div>
    );
    let link = null;
    if (preview) {
      const previewURL = `/buckets/${preview.bucket}/collections/${preview.collection}/records`;
      link = <Link to={previewURL}>{previewURL}</Link>;
    }
    const review_details = (
      <div>
        <ul>
          <li><strong>Editor: </strong> {last_editor}</li>
          <li><strong>Preview URL: </strong> {link || "Preview disabled"}</li>
        </ul>
        <span>
          <a className="btn btn-success"
             href="#"
             onClick={(event) => {
               event.preventDefault();
               dispatch(approveChanges());
             }}><i className="glyphicon glyphicon-ok"></i> Approve</a>
          <a className="btn btn-danger"
             href="#"
             onClick={(event) => {
               event.preventDefault();
               dispatch(declineChanges());
             }}><i className="glyphicon glyphicon-remove"></i> Decline</a>

        </span>
      </div>
    );
    const signed_details = (
      <div>
        <ul>
          <li><strong>Reviewer: </strong>{last_reviewer}</li>
        </ul>
        <a className="btn btn-info"
           href="#"
           onClick={(event) => {
             event.preventDefault();
             dispatch(approveChanges());
           }}>Re-sign</a>
      </div>
    );

    const steps = [
      {label: "Work in progress", details: wip_details},
      {label: "Waiting review", details: review_details},
      {label: "Signed", details: signed_details},
    ];

    return (
      <div>
        <ProgressBar active={step} steps={steps}/>
      </div>
      );

  }
}


export const sagas = [
  [takeEvery, PLUGIN_REVIEW_REQUEST, handleSignoffRequest],
  [takeEvery, PLUGIN_DECLINE_REQUEST, handleSignoffRequest],
  [takeEvery, PLUGIN_SIGNOFF_REQUEST, handleSignoffRequest],
];

export const reducers = {};

export function register(store) {
  const hooks = {
    CollectionRecords: {
      ListActions: [
        <SignoffButton key="request-signoff-btn"
                       getState={store.getState.bind(store)}
                       dispatch={store.dispatch.bind(store)} />
      ]
    }
  };

  return {
    hooks,
  };
}
