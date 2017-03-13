/* @flow */
import type { AppState } from "../types";
import type { Dispatch, ActionCreatorOrObjectOfACs } from "redux";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import App from "../components/App";
import * as SessionActions from "../actions/session";

function mapStateToProps(state: AppState) {
  return {
    notificationList: state.notifications,
    session: state.session,
  };
}

function mapDispatchToProps(dispatch: Dispatch): ActionCreatorOrObjectOfACs {
  return bindActionCreators(SessionActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
