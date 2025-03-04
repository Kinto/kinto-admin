import * as BucketActions from "@src/actions/bucket";
import BucketHistory from "@src/components/bucket/BucketHistory";
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

type DispatchProps = typeof BucketActions;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...BucketActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(BucketHistory);
