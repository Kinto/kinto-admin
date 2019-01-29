/* @flow */
import type { AppState } from "../../types";
import type { DispatchAPI } from "redux";
import type {
  Props,
  StateProps,
  OwnProps,
} from "../../components/record/RecordCreate";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { push as updatePath } from "connected-react-router";

import RecordCreate from "../../components/record/RecordCreate";
import * as CollectionActions from "../../actions/collection";
import * as NotificationsActions from "../../actions/notifications";

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    bucket: state.bucket,
    collection: state.collection,
    capabilities: state.session.serverInfo.capabilities,
  };
}

// FIXME: component doesn't need NotificationsActions
type DispatchProps = {|
  ...typeof CollectionActions,
  ...typeof NotificationsActions,
  updatePath: typeof updatePath,
|};

function mapDispatchToProps(dispatch: DispatchAPI<*>): DispatchProps {
  return bindActionCreators(
    {
      ...CollectionActions,
      ...NotificationsActions,
      updatePath,
    },
    dispatch
  );
}

export default connect<Props, OwnProps, _, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(RecordCreate);
