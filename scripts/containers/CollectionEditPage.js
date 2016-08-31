import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import CollectionEdit from "../components/collection/CollectionEdit";
import * as BucketActions from "../actions/bucket";


function mapStateToProps(state) {
  return {
    bucket: state.bucket,
    collection: state.collection,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionEdit);
