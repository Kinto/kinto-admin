import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/group/GroupHistory";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import GroupHistory from "../../components/group/GroupHistory";
import * as GroupActions from "../../actions/group";
import * as NotificationsActions from "../../actions/notifications";

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
