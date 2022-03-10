import type { AppState } from "../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../components/Sidebar";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../components/Sidebar";
import * as SessionActions from "../actions/session";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof SessionActions {
  return bindActionCreators(
    {
      ...SessionActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
