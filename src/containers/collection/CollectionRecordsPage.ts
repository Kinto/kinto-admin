import * as CollectionActions from "@src/actions/collection";
import type { StateProps } from "@src/components/collection/CollectionRecords";
import CollectionRecords from "@src/components/collection/CollectionRecords";
import type { AppState } from "@src/types";
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

type DispatchProps = typeof CollectionActions;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...CollectionActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionRecords);
