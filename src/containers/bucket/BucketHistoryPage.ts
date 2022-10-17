import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/bucket/BucketHistory";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import BucketHistory from "../../components/bucket/BucketHistory";
import * as BucketActions from "../../actions/bucket";
import * as NotificationsActions from "../../actions/notifications";

function mapStateToProps(state: AppState): StateProps {
  return {
    bucket: state.bucket,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

type DispatchProps = typeof BucketActions & typeof NotificationsActions;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...BucketActions,
      ...NotificationsActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(BucketHistory);
