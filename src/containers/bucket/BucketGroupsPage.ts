import * as BucketActions from "../../actions/bucket";
import * as NotificationsActions from "../../actions/notifications";
import type { StateProps } from "../../components/bucket/BucketGroups";
import BucketGroups from "../../components/bucket/BucketGroups";
import type { AppState } from "../../types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";
import { push as updatePath } from "redux-first-history";

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
