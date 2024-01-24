import * as BucketActions from "../../actions/bucket";
import type { StateProps } from "../../components/bucket/BucketAttributes";
import BucketAttributes from "../../components/bucket/BucketAttributes";
import type { AppState } from "../../types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

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
