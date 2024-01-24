import * as BucketActions from "../../actions/bucket";
import * as NotificationsActions from "../../actions/notifications";
import type { StateProps } from "../../components/bucket/BucketHistory";
import BucketHistory from "../../components/bucket/BucketHistory";
import type { AppState } from "../../types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

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
