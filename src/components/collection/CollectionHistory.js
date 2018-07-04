/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  CollectionRouteParams,
  HistoryFilters,
  RouteLocation,
} from "../../types";

import React, { PureComponent } from "react";

import HistoryTable from "../HistoryTable";
import CollectionTabs from "./CollectionTabs";

type Props = {
  session: SessionState,
  bucket: BucketState,
  collection: CollectionState,
  capabilities: Capabilities,
  params: CollectionRouteParams,
  location: RouteLocation,
  listCollectionHistory: (
    bid: string,
    cid: string,
    filters: HistoryFilters
  ) => void,
  listCollectionNextHistory: () => void,
  notifyError: (message: string, error: ?Error) => void,
  routing: Object,
};

export default class CollectionHistory extends PureComponent<Props> {
  onCollectionHistoryEnter() {
    const { listCollectionHistory, params, routing, session } = this.props;
    const { bid, cid } = params;
    const {
      locationBeforeTransitions: { query: filters },
    } = routing;
    if (!session.authenticated) {
      // We're not authenticated, skip requesting the list of records. This likely
      // occurs when users refresh the page and lose their session.
      return;
    }
    listCollectionHistory(bid, cid, filters);
  }

  componentDidMount = this.onCollectionHistoryEnter;
  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.location !== this.props.location) {
      this.onCollectionHistoryEnter();
    }
  };

  render() {
    const {
      params,
      collection,
      capabilities,
      location,
      listCollectionNextHistory,
      notifyError,
    } = this.props;
    const { bid, cid } = params;
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
