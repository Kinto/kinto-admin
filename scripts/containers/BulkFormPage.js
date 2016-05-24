import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { push as updatePath } from "react-router-redux";

import BulkForm from "../components/BulkForm";
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
    ...NotificationsActions,
    updatePath
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BulkForm);
