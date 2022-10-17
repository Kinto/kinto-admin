import type {
  Capabilities,
  BucketState,
  BucketRouteMatch,
  SessionState,
} from "../../types";
import type { Location } from "history";

import React, { PureComponent } from "react";

import * as BucketActions from "../../actions/bucket";
import * as NotificationActions from "../../actions/notifications";
import { parseHistoryFilters } from "../../utils";
import BucketTabs from "./BucketTabs";
import HistoryTable from "../HistoryTable";

export type OwnProps = {
  match: BucketRouteMatch;
  location: Location;
};

export type StateProps = {
  bucket: BucketState;
  capabilities: Capabilities;
  session: SessionState;
};

export type Props = OwnProps &
  StateProps & {
    listBucketHistory: typeof BucketActions.listBucketHistory;
    listBucketNextHistory: typeof BucketActions.listBucketNextHistory;
    notifyError: typeof NotificationActions.notifyError;
  };

export const onBucketHistoryEnter = (props: Props) => {
  const { listBucketHistory, match, session, location } = props;
  const {
    params: { bid },
  } = match;
  const filters = parseHistoryFilters(location.search);
  if (!session.authenticated) {
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  listBucketHistory(bid, filters);
};

export default class BucketHistory extends PureComponent<Props> {
  componentDidMount = () => onBucketHistoryEnter(this.props);
  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.location !== this.props.location) {
      onBucketHistoryEnter(this.props);
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
    const {
      params: { bid },
    } = match;
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
