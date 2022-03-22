import type { AppState } from "../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../components/Layout";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import Layout from "../components/Layout";
import * as SessionActions from "../actions/session";
import * as RouteActions from "../actions/route";

function mapStateToProps(state: AppState): StateProps {
  return {
    notificationList: state.notifications,
    session: state.session,
  };
}

type DispatchProps = typeof SessionActions & typeof RouteActions;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...SessionActions,
      ...RouteActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
