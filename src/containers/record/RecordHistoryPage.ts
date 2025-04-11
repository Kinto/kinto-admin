import type { StateProps } from "@src/components/record/RecordHistory";
import RecordHistory from "@src/components/record/RecordHistory";
import type { AppState } from "@src/types";
import { connect } from "react-redux";

function mapStateToProps(state: AppState): StateProps {
  return {
    record: state.record,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

export default connect(mapStateToProps)(RecordHistory);
