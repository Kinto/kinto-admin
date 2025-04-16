import * as BucketActions from "@src/actions/bucket";
import BucketGroups from "@src/components/bucket/BucketGroups";
import type { AppState } from "@src/types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

function mapStateToProps(state: AppState) {
  return {
    bucket: state.bucket,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

export type DispatchProps = typeof BucketActions;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...BucketActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(BucketGroups);
