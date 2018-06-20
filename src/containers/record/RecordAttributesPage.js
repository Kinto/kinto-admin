/* @flow */
import type { AppState } from "../../types";
import type { Dispatch, ActionCreatorOrObjectOfACs } from "redux";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { push as updatePath } from "react-router-redux";

import RecordAttributes from "../../components/record/RecordAttributes";
import * as CollectionActions from "../../actions/collection";
import * as NotificationsActions from "../../actions/notifications";

function mapStateToProps(state: AppState) {
  return {
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
    bucket: state.bucket,
    collection: state.collection,
    record: state.record,
  };
}

function mapDispatchToProps(dispatch: Dispatch): ActionCreatorOrObjectOfACs {
  return bindActionCreators(
    {
      ...CollectionActions,
      ...NotificationsActions,
      updatePath,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(RecordAttributes);
