import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Settings from "../components/Settings";
import * as SettingsActions from "../actions/settings";
import * as NotificationsActions from "../actions/notifications";
import * as ServerInfoActions from "../actions/serverInfo";

function mapStateToProps(state) {
  return {
    notifications: state.notifications,
    settings: state.settings,
    serverInfo: state.serverInfo,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, SettingsActions, NotificationsActions, ServerInfoActions),
    dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
