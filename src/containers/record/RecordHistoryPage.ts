import * as NotificationsActions from "../../actions/notifications";
import * as RecordActions from "../../actions/record";
import type { StateProps } from "../../components/record/RecordHistory";
import RecordHistory from "../../components/record/RecordHistory";
import type { AppState } from "../../types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

function mapStateToProps(state: AppState): StateProps {
  return {
    record: state.record,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

type DispatchProps = typeof RecordActions & typeof NotificationsActions;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...RecordActions,
      ...NotificationsActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(RecordHistory);
