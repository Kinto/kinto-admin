import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import CollectionList from "../components/CollectionList";
import * as CollectionActions from "../actions/collection";
import * as NotificationsActions from "../actions/notifications";
import { updatePath } from "redux-simple-router";

function mapStateToProps(state) {
  return {
    collection: state.collection,
    collections: state.collections,
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, CollectionActions, NotificationsActions, {updatePath}),
    dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionList);

