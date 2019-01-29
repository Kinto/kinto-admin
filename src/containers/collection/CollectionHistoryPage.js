/* @flow */
import type { AppState } from "../../types";
import type { DispatchAPI } from "redux";
import type {
  Props,
  StateProps,
  OwnProps,
} from "../../components/collection/CollectionHistory";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import CollectionHistory from "../../components/collection/CollectionHistory";
import * as CollectionActions from "../../actions/collection";
import * as NotificationsActions from "../../actions/notifications";

function mapStateToProps(state: AppState): StateProps {
  return {
    collection: state.collection,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

type DispatchProps = {|
  ...typeof CollectionActions,
  ...typeof NotificationsActions,
|};

function mapDispatchToProps(dispatch: DispatchAPI<*>): DispatchProps {
  return bindActionCreators(
    {
      ...CollectionActions,
      ...NotificationsActions,
    },
    dispatch
  );
}

export default connect<Props, OwnProps, StateProps, _, _, _>( // eslint-disable-line
  mapStateToProps,
  mapDispatchToProps
)(CollectionHistory);
