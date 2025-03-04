import * as CollectionActions from "@src/actions/collection";
import * as RouteActions from "@src/actions/route";
import type { StateProps } from "@src/components/collection/CollectionRecords";
import CollectionRecords from "@src/components/collection/CollectionRecords";
import type { AppState } from "@src/types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";
import { push as updatePath } from "redux-first-history";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    bucket: state.bucket,
    collection: state.collection,
    capabilities: state.session.serverInfo.capabilities,
  };
}

type DispatchProps = typeof CollectionActions &
  typeof RouteActions & {
    updatePath: typeof updatePath;
  };

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...CollectionActions,
      ...RouteActions,
      updatePath,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionRecords);
