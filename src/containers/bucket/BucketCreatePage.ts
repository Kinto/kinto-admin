import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/bucket/BucketCreate";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import BucketCreate from "../../components/bucket/BucketCreate";
import * as BucketActions from "../../actions/bucket";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    bucket: state.bucket,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BucketCreate);
