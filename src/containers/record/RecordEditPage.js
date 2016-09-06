import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { push as updatePath } from "react-router-redux";

import RecordEdit from "../../components/record/RecordEdit";
import * as CollectionActions from "../../actions/collection";
import * as NotificationsActions from "../../actions/notifications";


function mapStateToProps(state) {
  return {
    collection: state.collection,
    session: state.session,
    record: state.record,
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
)(RecordEdit);

