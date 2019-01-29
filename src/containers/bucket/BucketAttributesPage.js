/* @flow */
import type { AppState } from "../../types";
import type { DispatchAPI } from "redux";
import type {
  Props,
  OwnProps,
  StateProps,
} from "../../components/bucket/BucketAttributes";

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

function mapDispatchToProps(dispatch: DispatchAPI<*>): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect<Props, OwnProps, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(BucketAttributes);
