import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import CollectionCreate from "../components/CollectionCreate";
import * as ClientActions from "../actions/client";


function mapStateToProps(state) {
  return {
    session: state.session
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ClientActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionCreate);
