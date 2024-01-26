import * as CollectionActions from "@src/actions/collection";
import type { StateProps } from "@src/components/record/RecordAttributes";
import RecordAttributes from "@src/components/record/RecordAttributes";
import type { AppState } from "@src/types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

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
