import * as NotificationsActions from "@src/actions/notifications";
import type { StateProps } from "@src/components/Notifications";
import Notifications from "@src/components/Notifications";
import type { AppState } from "@src/types";
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
