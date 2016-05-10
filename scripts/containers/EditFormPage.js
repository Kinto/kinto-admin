import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import EditForm from "../components/EditForm";
import * as CollectionActions from "../actions/collection";
import * as FormActions from "../actions/form";
import * as NotificationsActions from "../actions/notifications";

function mapStateToProps(state) {
  return {
    name: state.collection.name,
    config: state.collection.config,
    schema: state.collection.schema,
    uiSchema: state.collection.uiSchema,
    form: state.form,
    liveValidate: state.liveValidate,
  };
}

function mapDispatchToProps(dispatch) {
  const combinedActions = {
    ...CollectionActions,
    ...FormActions,
    ...NotificationsActions
  };
  return bindActionCreators(combinedActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditForm);

