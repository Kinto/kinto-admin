import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/collection/CollectionPermissions";

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

function mapDispatchToProps(dispatch: Dispatch): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionPermissions);
