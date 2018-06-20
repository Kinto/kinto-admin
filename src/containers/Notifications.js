/* @flow */
import type { AppState } from "../types";
import type { Dispatch, ActionCreatorOrObjectOfACs } from "redux";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Notifications from "../components/Notifications";
import * as NotificationsActions from "../actions/notifications";

function mapStateToProps(state: AppState) {
  return {
    notifications: state.notifications,
  };
}

function mapDispatchToProps(dispatch: Dispatch): ActionCreatorOrObjectOfACs {
  return bindActionCreators(NotificationsActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
