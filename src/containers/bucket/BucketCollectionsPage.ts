import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/bucket/BucketCollections";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import BucketCollections from "../../components/bucket/BucketCollections";
import * as BucketActions from "../../actions/bucket";

function mapStateToProps(state: AppState): StateProps {
  return {
    bucket: state.bucket,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BucketCollections);
