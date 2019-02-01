/* @flow */
import type { AppState } from "../../types";
import type { DispatchAPI } from "redux";
import type {
  Props,
  StateProps,
  OwnProps,
} from "../../components/group/GroupHistory";

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

type DispatchProps = {|
  ...typeof GroupActions,
  ...typeof NotificationsActions,
|};

function mapDispatchToProps(dispatch: DispatchAPI<*>): DispatchProps {
  return bindActionCreators(
    {
      ...GroupActions,
      ...NotificationsActions,
    },
    dispatch
  );
}

export default connect<Props, OwnProps, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(GroupHistory);
