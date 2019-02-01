/* @flow */
import type { AppState } from "../types";
import type { DispatchAPI } from "redux";
import type { Props, OwnProps, StateProps } from "../components/App";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import App from "../components/App";
import * as SessionActions from "../actions/session";
import * as RouteActions from "../actions/route";

function mapStateToProps(state: AppState): StateProps {
  return {
    notificationList: state.notifications,
    session: state.session,
  };
}

type DispatchProps = {|
  ...typeof SessionActions,
  ...typeof RouteActions,
|};

function mapDispatchToProps(dispatch: DispatchAPI<*>): DispatchProps {
  return bindActionCreators(
    {
      ...SessionActions,
      ...RouteActions,
    },
    dispatch
  );
}

export default connect<Props, OwnProps, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(App);
