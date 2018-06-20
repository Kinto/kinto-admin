/* @flow */
import type { AppState } from "../types";
import type { Dispatch, ActionCreatorOrObjectOfACs } from "redux";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import HomePage from "../components/HomePage";
import * as NotificationActions from "../actions/notifications";
import * as SessionActions from "../actions/session";
import * as HistoryActions from "../actions/history";

function mapStateToProps(state: AppState) {
  return {
    session: state.session,
    settings: state.settings,
    history: state.history,
  };
}

function mapDispatchToProps(dispatch: Dispatch): ActionCreatorOrObjectOfACs {
  return bindActionCreators(
    {
      ...SessionActions,
      ...NotificationActions,
      ...HistoryActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
