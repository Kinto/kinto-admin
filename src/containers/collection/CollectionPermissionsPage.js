/* @flow */
import type { AppState } from "../../types";
import type { DispatchAPI } from "redux";
import type {
  Props,
  OwnProps,
  StateProps,
} from "../../components/collection/CollectionPermissions";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import CollectionPermissions from "../../components/collection/CollectionPermissions";
import * as BucketActions from "../../actions/bucket";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    bucket: state.bucket,
    collection: state.collection,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch: DispatchAPI<*>): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect<Props, OwnProps, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(CollectionPermissions);
