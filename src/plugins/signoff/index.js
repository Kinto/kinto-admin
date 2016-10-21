import React from "react";
import { takeEvery } from "redux-saga";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as adminConstants from "../../plugingConstants";
import * as pluginConstants from "./constants";
import * as SignoffActions from "./actions";
import SignoffToolBar from "./components.js";
import {
  onCollectionRecordsRequest,
  handleRequestReview,
  handleDeclineChanges,
  handleApproveChanges
} from "./sagas";

import "./styles.css";

//
// Sagas
//

export const sagas = [
  [takeEvery, adminConstants.COLLECTION_RECORDS_REQUEST, onCollectionRecordsRequest],
  [takeEvery, pluginConstants.PLUGIN_REVIEW_REQUEST, handleRequestReview],
  [takeEvery, pluginConstants.PLUGIN_DECLINE_REQUEST, handleDeclineChanges],
  [takeEvery, pluginConstants.PLUGIN_SIGNOFF_REQUEST, handleApproveChanges],
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
      case pluginConstants.SIGNOFF_WORKFLOW_INFO: {
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
