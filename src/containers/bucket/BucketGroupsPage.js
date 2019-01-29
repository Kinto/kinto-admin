/* @flow */
import type { AppState } from "../../types";
import type { DispatchAPI } from "redux";
import type {
  Props,
  OwnProps,
  StateProps,
} from "../../components/bucket/BucketGroups";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { push as updatePath } from "connected-react-router";

import BucketGroups from "../../components/bucket/BucketGroups";
import * as BucketActions from "../../actions/bucket";
import * as NotificationsActions from "../../actions/notifications";

function mapStateToProps(state: AppState): StateProps {
  return {
    bucket: state.bucket,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

export type DispatchProps = {|
  ...typeof BucketActions,
  ...typeof NotificationsActions,
  updatePath: typeof updatePath,
|};

function mapDispatchToProps(dispatch: DispatchAPI<*>): DispatchProps {
  return bindActionCreators(
    {
      ...BucketActions,
      ...NotificationsActions,
      updatePath,
    },
    dispatch
  );
}

export default connect<Props, OwnProps, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(BucketGroups);
