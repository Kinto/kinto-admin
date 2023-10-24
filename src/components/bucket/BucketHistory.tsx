import type {
  Capabilities,
  BucketState,
  BucketRouteMatch,
  SessionState,
} from "../../types";
import type { Location } from "history";

import React, { useEffect } from "react";

import * as BucketActions from "../../actions/bucket";
import * as NotificationActions from "../../actions/notifications";
import { parseHistoryFilters } from "../../utils";
import BucketTabs from "./BucketTabs";
import HistoryTable from "../HistoryTable";

type OwnProps = {
  match: BucketRouteMatch;
  location: Location;
};

type StateProps = {
  bucket: BucketState;
  capabilities: Capabilities;
  session: SessionState;
};

type Props = OwnProps &
  StateProps & {
    listBucketHistory: typeof BucketActions.listBucketHistory;
    listBucketNextHistory: typeof BucketActions.listBucketNextHistory;
    notifyError: typeof NotificationActions.notifyError;
};

export const onBucketHistoryEnter = (props: Props) => {
  const { listBucketHistory, match, session, location } = props;
  const { params: { bid } } = match;
  const filters = parseHistoryFilters(location.search);
  if (!session.authenticated) {
    return;
  }
  listBucketHistory(bid, filters);
};

const BucketHistory: React.FC<Props> = (props) => {
  const {
    match,
    bucket,
    capabilities,
    location,
    listBucketNextHistory,
    notifyError,
  } = props;

  useEffect(() => {
    onBucketHistoryEnter(props);
  }, [props.location]);

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
};

export default BucketHistory;
