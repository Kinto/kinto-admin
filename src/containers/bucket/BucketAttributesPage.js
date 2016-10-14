import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import BucketAttributes from "../../components/bucket/BucketAttributes";
import * as BucketActions from "../../actions/bucket";


function mapStateToProps(state) {
  return {
    session: state.session,
    bucket: state.bucket,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BucketAttributes);
