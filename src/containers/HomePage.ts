import type { AppState } from "../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../components/HomePage";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import HomePage from "../components/HomePage";
import * as NotificationActions from "../actions/notifications";
import { sessionActions } from "../slices/session";
import * as ServersActions from "../actions/servers";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    settings: state.settings,
    servers: state.servers,
  };
}

type DispatchProps = typeof sessionActions &
  typeof NotificationActions &
  typeof ServersActions;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...sessionActions,
      ...NotificationActions,
      ...ServersActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
