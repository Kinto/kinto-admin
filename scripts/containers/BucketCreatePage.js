import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import BucketCreateForm from "../components/bucket/BucketCreateForm";
import * as BucketActions from "../actions/bucket";


function mapStateToProps(state) {
  return {
    session: state.session,
    bucket: state.bucket,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BucketCreateForm);
