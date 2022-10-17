import type { AppState } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/record/RecordBulk";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import RecordBulk from "../../components/record/RecordBulk";
import * as CollectionActions from "../../actions/collection";
import * as NotificationsActions from "../../actions/notifications";

function mapStateToProps(state: AppState): StateProps {
  return {
    collection: state.collection,
  };
}

type DispatchProps = typeof CollectionActions & typeof NotificationsActions;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators(
    {
      ...CollectionActions,
      ...NotificationsActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(RecordBulk);
