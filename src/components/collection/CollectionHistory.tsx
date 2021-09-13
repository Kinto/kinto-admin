import type {
  Capabilities,
  SessionState,
  CollectionState,
  CollectionRouteMatch,
} from "../../types";
import type { Location } from "history";

import React, { PureComponent } from "react";

import * as CollectionActions from "../../actions/collection";
import * as NotificationActions from "../../actions/notifications";
import { parseHistoryFilters } from "../../utils";
import HistoryTable from "../HistoryTable";
import CollectionTabs from "./CollectionTabs";

export type OwnProps = {
  match: CollectionRouteMatch;
  location: Location;
};

export type StateProps = {
  session: SessionState;
  collection: CollectionState;
  capabilities: Capabilities;
};

export type Props = OwnProps &
  StateProps & {
    listCollectionHistory: typeof CollectionActions.listCollectionHistory;
    listCollectionNextHistory: typeof CollectionActions.listCollectionNextHistory;
    notifyError: typeof NotificationActions.notifyError;
  };

export const onCollectionHistoryEnter = (props: Props) => {
  const { listCollectionHistory, match, session, location } = props;
  const {
    params: { bid, cid },
  } = match;
  const filters = parseHistoryFilters(location.search);
  if (!session.authenticated) {
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  listCollectionHistory(bid, cid, filters);
};

export default class CollectionHistory extends PureComponent<Props> {
  componentDidMount = () => onCollectionHistoryEnter(this.props);
  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.location !== this.props.location) {
      onCollectionHistoryEnter(this.props);
    }
  };

  render() {
    const {
      match,
      collection,
      capabilities,
      location,
      listCollectionNextHistory,
      notifyError,
    } = this.props;
    const {
      params: { bid, cid },
    } = match;
    const {
      history: { entries, loaded, hasNextPage },
    } = collection;

    return (
      <div>
        <h1>
          History for{" "}
          <b>
            {bid}/{cid}
          </b>
        </h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          selected="history"
          capabilities={capabilities}
        >
          <HistoryTable
            enableDiffOverview
            bid={bid}
            cid={cid}
            historyLoaded={loaded}
            history={entries}
            hasNextHistory={hasNextPage}
            listNextHistory={listCollectionNextHistory}
            location={location}
            notifyError={notifyError}
          />
        </CollectionTabs>
      </div>
    );
  }
}
