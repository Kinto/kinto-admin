import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { push as updatePath } from "react-router-redux";

import GroupHistory from "../components/group/GroupHistory";
import * as GroupActions from "../actions/group";
import * as NotificationsActions from "../actions/notifications";


function mapStateToProps(state) {
  return {
    group: state.group,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...GroupActions,
    ...NotificationsActions,
    updatePath
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupHistory);
