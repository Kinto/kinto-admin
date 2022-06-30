import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/bucket/BucketGroups";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { push as updatePath } from "redux-first-history";

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

export type DispatchProps = typeof BucketActions &
  typeof NotificationsActions & {
    updatePath: typeof updatePath;
  };

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...BucketActions,
      ...NotificationsActions,
      updatePath,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(BucketGroups);
