/* @flow */
import type { AppState } from "../../types";
import type { DispatchAPI } from "redux";
import type {
  Props,
  StateProps,
  OwnProps,
} from "../../components/record/RecordPermissions";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import RecordPermissions from "../../components/record/RecordPermissions";
import * as CollectionActions from "../../actions/collection";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
    bucket: state.bucket,
    collection: state.collection,
    record: state.record,
  };
}

function mapDispatchToProps(
  dispatch: DispatchAPI<*>
): typeof CollectionActions {
  return bindActionCreators(CollectionActions, dispatch);
}

export default connect<Props, OwnProps, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(RecordPermissions);
