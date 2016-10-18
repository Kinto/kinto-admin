import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { push as updatePath } from "react-router-redux";

import CollectionRecords from "../../components/collection/CollectionRecords";
import * as CollectionActions from "../../actions/collection";
import * as NotificationsActions from "../../actions/notifications";
import * as RouteActions from "../../actions/route";


function mapStateToProps(state) {
  return {
    session: state.session,
    bucket: state.bucket,
    collection: state.collection,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...CollectionActions,
    ...NotificationsActions,
    ...RouteActions,
    updatePath
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionRecords);

