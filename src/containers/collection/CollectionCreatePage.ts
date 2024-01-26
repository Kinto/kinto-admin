import * as BucketActions from "@src/actions/bucket";
import type { StateProps } from "@src/components/collection/CollectionCreate";
import CollectionCreate from "@src/components/collection/CollectionCreate";
import type { AppState } from "@src/types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

function mapStateToProps(state: AppState): StateProps {
  return {
    bucket: state.bucket,
    collection: state.collection,
    session: state.session,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof BucketActions {
  return bindActionCreators(BucketActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionCreate);
