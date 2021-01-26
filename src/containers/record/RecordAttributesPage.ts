import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/record/RecordAttributes";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import RecordAttributes from "../../components/record/RecordAttributes";
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

function mapDispatchToProps(dispatch: Dispatch): typeof CollectionActions {
  return bindActionCreators(CollectionActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RecordAttributes);
