import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import CollectionEdit from "../components/CollectionEdit";
import * as SessionActions from "../actions/session";


function mapStateToProps(state) {
  return {
    session: state.session
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SessionActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionEdit);
