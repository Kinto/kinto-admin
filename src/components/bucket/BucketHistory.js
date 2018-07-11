/* @flow */
import type {
  Capabilities,
  BucketState,
  BucketRouteMatch,
  HistoryFilters,
  RouteLocation,
  SessionState,
} from "../../types";

import React, { PureComponent } from "react";

import BucketTabs from "./BucketTabs";
import HistoryTable from "../HistoryTable";

type Props = {
  match: BucketRouteMatch,
  bucket: BucketState,
  capabilities: Capabilities,
  location: RouteLocation,
  listBucketHistory: (bid: string, filters: HistoryFilters) => void,
  listBucketNextHistory: () => void,
  notifyError: (message: string, error: ?Error) => void,
  location: Location,
  session: SessionState,
  routing: Object,
};

export default class BucketHistory extends PureComponent<Props> {
  onBucketHistoryEnter() {
    const { listBucketHistory, match, session, routing } = this.props;
    const { bid } = match.params;
    const {
      locationBeforeTransitions: { query: filters },
    } = routing;
    if (!session.authenticated) {
      // We're not authenticated, skip requesting the list of records. This likely
      // occurs when users refresh the page and lose their session.
      return;
    }
    listBucketHistory(bid, filters);
  }

  componentDidMount = this.onBucketHistoryEnter;
  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.location !== this.props.location) {
      this.onBucketHistoryEnter();
    }
  };

  render() {
    const {
      match,
      bucket,
      capabilities,
      location,
      listBucketNextHistory,
      notifyError,
    } = this.props;
    const { bid } = match.params;
    const {
      history: { entries, loaded, hasNextPage: hasNextHistoryPage },
    } = bucket;

    return (
      <div>
        <h1>
          History for <b>{bid}</b>
        </h1>
        <BucketTabs bid={bid} selected="history" capabilities={capabilities}>
          <HistoryTable
            bid={bid}
            historyLoaded={loaded}
            history={entries}
            hasNextHistory={hasNextHistoryPage}
            listNextHistory={listBucketNextHistory}
            location={location}
            notifyError={notifyError}
          />
        </BucketTabs>
      </div>
    );
  }
}
