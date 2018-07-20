/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  CollectionRouteMatch,
  HistoryFilters,
} from "../../types";
import type { Location } from "react-router-dom";

import React, { PureComponent } from "react";

import HistoryTable from "../HistoryTable";
import CollectionTabs from "./CollectionTabs";

type Props = {
  session: SessionState,
  bucket: BucketState,
  collection: CollectionState,
  capabilities: Capabilities,
  match: CollectionRouteMatch,
  location: Location,
  listCollectionHistory: (
    bid: string,
    cid: string,
    filters: HistoryFilters
  ) => void,
  listCollectionNextHistory: () => void,
  notifyError: (message: string, error: ?Error) => void,
  router: Object,
};

export const onCollectionHistoryEnter = (props: Props) => {
  const { listCollectionHistory, match, router, session } = props;
  const { bid, cid } = match.params;
  const {
    location: { query: filters },
  } = router;
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
    const { bid, cid } = match.params;
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
          capabilities={capabilities}>
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
