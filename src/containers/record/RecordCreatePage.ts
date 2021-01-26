import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/record/RecordCreate";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import RecordCreate from "../../components/record/RecordCreate";
import * as CollectionActions from "../../actions/collection";

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
