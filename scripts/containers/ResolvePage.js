import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Resolve from "../components/Resolve";
import * as CollectionActions from "../actions/collection";
import * as ConflictsActions from "../actions/conflicts";
import * as NotificationsActions from "../actions/notifications";

function mapStateToProps(state) {
  return {
    notifications: state.notifications,
    conflicts: state.conflicts,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({},
    CollectionActions,
    ConflictsActions,
    NotificationsActions
  ), dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Resolve);
