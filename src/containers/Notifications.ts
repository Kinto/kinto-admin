import type { AppState } from "../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../components/Notifications";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Notifications from "../components/Notifications";
import * as NotificationsActions from "../actions/notifications";

function mapStateToProps(state: AppState): StateProps {
  return {
    notifications: state.notifications,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof NotificationsActions {
  return bindActionCreators(NotificationsActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
