import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import BucketCreateForm from "../components/BucketCreateForm";
import * as BucketActions from "../actions/bucket";


function mapStateToProps(state) {
  return {
    session: state.session,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BucketCreateForm);
