import React from "react";
import { takeEvery } from "redux-saga";
import { call, put } from "redux-saga/effects";

import { getClient } from "../../client";
import { notifySuccess, notifyError } from "../../actions/notifications";


const PLUGIN_SIGNOFF_REQUEST = "PLUGIN_SIGNOFF_REQUEST";

// Actions
function requestSignoff() {
  return {type: PLUGIN_SIGNOFF_REQUEST};
}


function* handleSignoffRequest(getState, action) {
  // Obtain current bucket and collection ids from state.
  const {collection:collectionState} = getState();
  const {bucket: bid, name: cid} = collectionState;

  // XXX: Currently the signoff feature does not exist on the server.
  // Meanwhile we will just trigger a signature.
  const client = getClient();
  // Set "status" metadata to trigger the signature.
  const coll = client.bucket(bid).collection(cid);
  try {
    yield call([coll, coll.setData], {status: "to-sign"}, {patch: true});
    yield put(notifySuccess("Signature requested."));
  } catch (e) {
    yield put(notifyError("Couldn't sign collection.", e));
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

    return (
      <a className="btn btn-info"
         href="#"
         onClick={(event) => {
           event.preventDefault();
           dispatch(requestSignoff());
         }}>Request signoff</a>
    );
  }
}


export const sagas = [
  [takeEvery, PLUGIN_SIGNOFF_REQUEST, handleSignoffRequest]
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
