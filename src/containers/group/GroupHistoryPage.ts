import * as GroupActions from "@src/actions/group";
import * as NotificationsActions from "@src/actions/notifications";
import type { StateProps } from "@src/components/group/GroupHistory";
import GroupHistory from "@src/components/group/GroupHistory";
import type { AppState } from "@src/types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

function mapStateToProps(state: AppState): StateProps {
  return {
    group: state.group,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

type DispatchProps = typeof GroupActions & typeof NotificationsActions;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...GroupActions,
      ...NotificationsActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupHistory);
