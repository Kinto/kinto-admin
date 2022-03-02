import type { Store } from "redux";

import React from "react";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as SignoffActions from "../../actions/signoff";
import SignoffToolBar from "./components";
import signoffReducer from "../../reducers/signoff";

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

export const sagas = [];

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

const SignoffContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignoffToolBar);

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
