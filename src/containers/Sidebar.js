/* @flow */
import type { AppState } from "../types";
import type { Dispatch, ActionCreatorOrObjectOfACs } from "redux";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../components/Sidebar";
import * as SessionActions from "../actions/session";

function mapStateToProps(state: AppState) {
  return {
    session: state.session,
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch: Dispatch): ActionCreatorOrObjectOfACs {
  return bindActionCreators(
    {
      ...SessionActions,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
