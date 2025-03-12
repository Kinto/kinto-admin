import type { StateProps } from "@src/components/group/GroupHistory";
import GroupHistory from "@src/components/group/GroupHistory";
import type { AppState } from "@src/types";
import { connect } from "react-redux";

function mapStateToProps(state: AppState): StateProps {
  return {
    group: state.group,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

export default connect(mapStateToProps)(GroupHistory);
