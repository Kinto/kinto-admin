import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/record/RecordHistory";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import RecordHistory from "../../components/record/RecordHistory";
import * as RecordActions from "../../actions/record";
import * as NotificationsActions from "../../actions/notifications";

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
