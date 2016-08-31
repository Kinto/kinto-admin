import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { push as updatePath } from "react-router-redux";

import CollectionHistory from "../components/collection/CollectionHistory";
import * as CollectionActions from "../actions/collection";
import * as NotificationsActions from "../actions/notifications";


function mapStateToProps(state) {
  return {
    collection: state.collection,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
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
)(CollectionHistory);

