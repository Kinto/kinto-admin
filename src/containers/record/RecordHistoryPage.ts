import * as RecordActions from "@src/actions/record";
import type { StateProps } from "@src/components/record/RecordHistory";
import RecordHistory from "@src/components/record/RecordHistory";
import type { AppState } from "@src/types";
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

type DispatchProps = typeof RecordActions;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...RecordActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(RecordHistory);
