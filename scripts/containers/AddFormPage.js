import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { updatePath } from "redux-simple-router";

import AddForm from "../components/AddForm";
import * as ClientActions from "../actions/client";
import * as CollectionActions from "../actions/collection";
import * as NotificationsActions from "../actions/notifications";


function mapStateToProps(state) {
  return {
    collection: state.collection,
    session: state.session,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...CollectionActions,
    ...ClientActions,
    ...NotificationsActions,
    updatePath
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddForm);
