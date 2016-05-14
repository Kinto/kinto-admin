import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import EditForm from "../components/EditForm";
import * as CollectionActions from "../actions/collection";
import * as NotificationsActions from "../actions/notifications";

function mapStateToProps(state) {
  return {
    collection: state.collection,
    session: state.session,
  };
}

function mapDispatchToProps(dispatch) {
  const combinedActions = {
    ...CollectionActions,
    ...NotificationsActions
  };
  return bindActionCreators(combinedActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditForm);

