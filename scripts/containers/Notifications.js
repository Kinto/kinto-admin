import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Notifications from "../components/Notifications";
import * as NotificationsActions from "../actions/notifications";

function mapStateToProps(state) {
  return {
    notifications: state.notifications,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(NotificationsActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Notifications);
