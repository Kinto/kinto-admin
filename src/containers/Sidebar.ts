import type { AppState } from "../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../components/Sidebar";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../components/Sidebar";
import { sessionActions } from "../slices/session";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof sessionActions {
  return bindActionCreators(
    {
      ...sessionActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
