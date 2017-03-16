/* @flow */
import type { AppState } from "../types";

import { connect } from "react-redux";
import Sidebar from "../components/Sidebar";

function mapStateToProps(state: AppState) {
  return {
    session: state.session,
    settings: state.settings,
  };
}

export default connect(mapStateToProps)(Sidebar);
