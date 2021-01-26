import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/bucket/BucketPermissions";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import BucketPermissions from "../../components/bucket/BucketPermissions";
import * as BucketActions from "../../actions/bucket";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    bucket: state.bucket,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BucketPermissions);
