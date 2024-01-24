import * as NotificationsActions from "../actions/notifications";
import type { StateProps } from "../components/Notifications";
import Notifications from "../components/Notifications";
import type { AppState } from "../types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

function mapStateToProps(state: AppState): StateProps {
  return {
    notifications: state.notifications,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof NotificationsActions {
  return bindActionCreators(NotificationsActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
