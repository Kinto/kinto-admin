import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import AddForm from "../components/AddForm";
import * as CollectionActions from "../actions/collection";
import * as NotificationsActions from "../actions/notifications";
import { updatePath } from "redux-simple-router";

function mapStateToProps(state) {
  return {
    name: state.collection.name,
    schema: state.collection.schema,
    form: state.form,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, CollectionActions, NotificationsActions, {updatePath}),
    dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddForm);

