import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/collection/CollectionAttributes";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import CollectionAttributes from "../../components/collection/CollectionAttributes";
import * as BucketActions from "../../actions/bucket";

function mapStateToProps(state: AppState): StateProps {
  return {
    bucket: state.bucket,
    collection: state.collection,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionAttributes);
