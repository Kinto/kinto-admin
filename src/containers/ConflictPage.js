import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ConflictPage from "../components/ConflictPage";
import * as ConflictActions from "../actions/conflict";
import * as NotificationsActions from "../actions/notifications";

function mapStateToProps(state) {
  return {
    notifications: state.notifications,
    conflict: state.conflict,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...ConflictActions,
    ...NotificationsActions
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConflictPage);
