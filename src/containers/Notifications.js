/* @flow */
import type { AppState } from "../types";
import type { DispatchAPI } from "redux";
import type { Props, StateProps } from "../components/Notifications";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Notifications from "../components/Notifications";
import * as NotificationsActions from "../actions/notifications";

function mapStateToProps(state: AppState): StateProps {
  return {
    notifications: state.notifications,
  };
}

function mapDispatchToProps(
  dispatch: DispatchAPI<*>
): typeof NotificationsActions {
  return bindActionCreators(NotificationsActions, dispatch);
}

export default connect<Props, {||}, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(Notifications);
