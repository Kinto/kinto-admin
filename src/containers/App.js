import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import App from "../components/App";
import * as SessionActions from "../actions/session";


function mapStateToProps(state) {
  return {
    notificationList: state.notifications,
    session: state.session,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SessionActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
