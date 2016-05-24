import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import HomePage from "../components/HomePage";
import * as NotificationActions from "../actions/notifications";
import * as SessionActions from "../actions/session";


function mapStateToProps(state) {
  return {
    session: state.session
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...SessionActions,
    ...NotificationActions
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomePage);
