import * as CollectionActions from "@src/actions/collection";
import type { StateProps } from "@src/components/collection/CollectionHistory";
import CollectionHistory from "@src/components/collection/CollectionHistory";
import type { AppState } from "@src/types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

function mapStateToProps(state: AppState): StateProps {
  return {
    collection: state.collection,
    session: state.session,
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

export default connect(mapStateToProps, mapDispatchToProps)(CollectionHistory);
