/* @flow */
import type { AppState } from "../../types";
import type { DispatchAPI } from "redux";
import type {
  Props,
  StateProps,
  OwnProps,
} from "../../components/group/GroupCreate";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import GroupCreate from "../../components/group/GroupCreate";
import * as BucketActions from "../../actions/bucket";

function mapStateToProps(state: AppState): StateProps {
  return {
    bucket: state.bucket,
    group: state.group,
    session: state.session,
  };
}

function mapDispatchToProps(dispatch: DispatchAPI<*>): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect<Props, OwnProps, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(GroupCreate);
