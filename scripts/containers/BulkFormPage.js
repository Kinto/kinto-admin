import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import BulkForm from "../components/BulkForm";
import * as CollectionActions from "../actions/collection";
import * as NotificationsActions from "../actions/notifications";
import { updatePath } from "redux-simple-router";

function mapStateToProps(state) {
  return {
    name: state.collection.name,
    config: state.collection.config,
    schema: state.collection.schema,
    uiSchema: state.collection.uiSchema,
    form: state.form,
    liveValidate: state.liveValidate,
    collection: state.collection,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {...CollectionActions, ...NotificationsActions, updatePath},
    dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BulkForm);
