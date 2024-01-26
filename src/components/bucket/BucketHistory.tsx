import BucketTabs from "./BucketTabs";
import * as BucketActions from "@src/actions/bucket";
import * as NotificationActions from "@src/actions/notifications";
import HistoryTable from "@src/components/HistoryTable";
import type {
  BucketRouteMatch,
  BucketState,
  Capabilities,
  SessionState,
} from "@src/types";
import { parseHistoryFilters } from "@src/utils";
import type { Location } from "history";
import React, { useEffect } from "react";

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
  const {
    params: { bid },
  } = match;
  const filters = parseHistoryFilters(location.search);
  if (!session.authenticated) {
    return;
  }
  listBucketHistory(bid, filters);
};

export default function BucketHistory(props: Props) {
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
}
