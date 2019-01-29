/* @flow */
import type { AppState } from "../../types";
import type { DispatchAPI } from "redux";
import type { Props, StateProps } from "../../components/bucket/BucketCreate";

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

function mapDispatchToProps(dispatch: DispatchAPI<*>): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect<Props, {||}, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(BucketCreate);
