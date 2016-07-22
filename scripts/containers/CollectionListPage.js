import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import CollectionList from "../components/CollectionList";
import * as CollectionActions from "../actions/collection";
import * as NotificationsActions from "../actions/notifications";
import { push as updatePath } from "react-router-redux";


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
)(CollectionList);

