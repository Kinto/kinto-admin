import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import CollectionCreate from "../components/CollectionCreate";
import * as BucketActions from "../actions/bucket";


function mapStateToProps(state) {
  return {
    bucket: state.bucket,
    collection: state.collection,
    session: state.session,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionCreate);
