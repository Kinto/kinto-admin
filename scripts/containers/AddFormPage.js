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
    uiSchema: state.collection.uiSchema,
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

