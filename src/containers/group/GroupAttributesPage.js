/* @flow */
import type { AppState } from "../../types";
import type { DispatchAPI } from "redux";
import type {
  Props,
  StateProps,
  OwnProps,
} from "../../components/group/GroupAttributes";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import GroupAttributes from "../../components/group/GroupAttributes";
import * as BucketActions from "../../actions/bucket";

function mapStateToProps(state: AppState): StateProps {
  return {
    bucket: state.bucket,
    group: state.group,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch: DispatchAPI<*>): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect<Props, OwnProps, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(GroupAttributes);
