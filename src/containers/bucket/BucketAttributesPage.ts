import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/bucket/BucketAttributes";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import BucketAttributes from "../../components/bucket/BucketAttributes";
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

export default connect(mapStateToProps, mapDispatchToProps)(BucketAttributes);
