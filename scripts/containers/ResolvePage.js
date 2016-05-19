import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Resolve from "../components/Resolve";
import * as CollectionActions from "../actions/collection";
import * as NotificationsActions from "../actions/notifications";

function mapStateToProps(state) {
  return {
    notifications: state.notifications,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...CollectionActions,
    ...NotificationsActions
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Resolve);
