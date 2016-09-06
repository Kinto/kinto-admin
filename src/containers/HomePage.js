import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import HomePage from "../components/HomePage";
import * as NotificationActions from "../actions/notifications";
import * as SessionActions from "../actions/session";
import * as HistoryActions from "../actions/history";


function mapStateToProps(state) {
  return {
    session: state.session,
    history: state.history,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...SessionActions,
    ...NotificationActions,
    ...HistoryActions,
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomePage);
