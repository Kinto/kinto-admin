import * as CollectionActions from "../../actions/collection";
import type { StateProps } from "../../components/record/RecordCreate";
import RecordCreate from "../../components/record/RecordCreate";
import type { AppState } from "../../types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    bucket: state.bucket,
    collection: state.collection,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof CollectionActions {
  return bindActionCreators(CollectionActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RecordCreate);
