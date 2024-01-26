import * as BucketActions from "@src/actions/bucket";
import * as NotificationsActions from "@src/actions/notifications";
import type { StateProps } from "@src/components/bucket/BucketGroups";
import BucketGroups from "@src/components/bucket/BucketGroups";
import type { AppState } from "@src/types";
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
