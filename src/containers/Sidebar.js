/* @flow */
import type { AppState } from "../types";
import type { DispatchAPI } from "redux";
import type { SidebarProps, StateProps, OwnProps } from "../components/Sidebar";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../components/Sidebar";
import * as SessionActions from "../actions/session";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch: DispatchAPI<*>): typeof SessionActions {
  return bindActionCreators(
    {
      ...SessionActions,
    },
    dispatch
  );
}

export default connect<SidebarProps, OwnProps, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
