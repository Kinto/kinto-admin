import type { Store } from "redux";

import React from "react";
import { takeEvery } from "redux-saga";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as adminConstants from "../../constants";
import * as pluginConstants from "./constants";
import * as SignoffActions from "./actions";
import SignoffToolBar from "./components.js";
import signoffReducer from "./reducer";
import {
  onCollectionRecordsRequest,
  handleRequestReview,
  handleDeclineChanges,
  handleApproveChanges,
} from "./sagas";

import "../../../css/plugins/signoff/styles.css";

//
// Reducers
//

export const reducers = {
  signoff: signoffReducer,
};

//
// Sagas
//

export const sagas = [
  [
    takeEvery,
    adminConstants.COLLECTION_RECORDS_REQUEST,
    onCollectionRecordsRequest,
  ],
  [takeEvery, pluginConstants.PLUGIN_REVIEW_REQUEST, handleRequestReview],
  [takeEvery, pluginConstants.PLUGIN_DECLINE_REQUEST, handleDeclineChanges],
  [takeEvery, pluginConstants.PLUGIN_SIGNOFF_REQUEST, handleApproveChanges],
];

//
// Container
//

function mapStateToProps(state) {
  const {
    session: sessionState,
    bucket: bucketState,
    collection: collectionState,
    signoff,
  } = state;
  return {
    sessionState,
    bucketState,
    collectionState,
    signoff,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SignoffActions, dispatch);
}

const SignoffContainer = connect(mapStateToProps, mapDispatchToProps)(
  SignoffToolBar
);

//
// Plugin register
//

export function register(store: Store) {
  const hooks = {
    CollectionRecords: {
      ListActions: [<SignoffContainer key="request-signoff-toolbar" />],
    },
  };

  return {
    hooks,
  };
}
