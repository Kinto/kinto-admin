import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { push as updatePath } from "react-router-redux";

import BucketHistory from "../components/bucket/BucketHistory";
import * as BucketActions from "../actions/bucket";
import * as NotificationsActions from "../actions/notifications";


function mapStateToProps(state) {
  return {
    bucket: state.bucket,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...BucketActions,
    ...NotificationsActions,
    updatePath
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BucketHistory);

