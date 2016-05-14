import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import CollectionEdit from "../components/CollectionEdit";
import * as ClientActions from "../actions/client";


function mapStateToProps(state) {
  return {
    collection: state.collection,
    session: state.session,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ClientActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionEdit);
