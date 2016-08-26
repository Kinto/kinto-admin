import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import GroupEdit from "../components/GroupEdit";
import * as BucketActions from "../actions/bucket";


function mapStateToProps(state) {
  return {
    bucket: state.bucket,
    group: state.group,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupEdit);
