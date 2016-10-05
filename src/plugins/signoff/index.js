import React from "react";
import { takeEvery } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { push as updatePath } from "react-router-redux";

import { getClient } from "../../client";
import { notifySuccess, notifyError } from "../../actions/notifications";


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

    // Hide button if this collection is not configured to be signed.
    const sources = capability.resources.map((r) => `${r.source.bucket}/${r.source.collection}`);
    if (!sources.includes(`${bid}/${cid}`)) {
      return null;
    }

    const {status="work-in-progress"} = collectionState.data;
    let action;
    let label;
    switch(status) {
      case "work-in-progress":
        action = requestReview();
        label = "Request review";
        break;
      case "to-review":
        action = approveChanges();
        label = "Approve changes";
        break;
      case "signed":
        action = approveChanges();
        label = "Re-sign";
        break;
      // XXX: empty ?
      // XXX: decline: to-review -> work-in-progress
    }

    return (
      <a className="btn btn-info"
         href="#"
         onClick={(event) => {
           event.preventDefault();
           dispatch(action);
         }}>{label}</a>
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
