import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/group/GroupCreate";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import GroupCreate from "../../components/group/GroupCreate";
import * as BucketActions from "../../actions/bucket";

function mapStateToProps(state: AppState): StateProps {
  return {
    bucket: state.bucket,
    group: state.group,
    session: state.session,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupCreate);
