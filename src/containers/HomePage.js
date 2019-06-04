/* @flow */
import type { AppState } from "../types";
import type { DispatchAPI } from "redux";
import type { Props, StateProps, OwnProps } from "../components/HomePage";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import HomePage from "../components/HomePage";
import * as NotificationActions from "../actions/notifications";
import * as SessionActions from "../actions/session";
import * as ServersActions from "../actions/servers";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    settings: state.settings,
    servers: state.servers,
  };
}

type DispatchProps = {|
  ...typeof SessionActions,
  ...typeof NotificationActions,
  ...typeof ServersActions,
|};

function mapDispatchToProps(dispatch: DispatchAPI<*>): DispatchProps {
  return bindActionCreators(
    {
      ...SessionActions,
      ...NotificationActions,
      ...ServersActions,
    },
    dispatch
  );
}

export default connect<Props, OwnProps, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(HomePage);
