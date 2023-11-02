import type {
  Capabilities,
  SessionState,
  RecordState,
  RecordRouteMatch,
} from "../../types";
import type { Location } from "history";

import React, { useEffect } from "react";

import * as RecordActions from "../../actions/record";
import * as NotificationActions from "../../actions/notifications";
import HistoryTable from "../HistoryTable";
import RecordTabs from "./RecordTabs";

export type OwnProps = {
  match: RecordRouteMatch;
  location: Location;
};

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
  record: RecordState;
};

export type Props = OwnProps &
  StateProps & {
    listRecordHistory: typeof RecordActions.listRecordHistory;
    listRecordNextHistory: typeof RecordActions.listRecordNextHistory;
    notifyError: typeof NotificationActions.notifyError;
  };

export const onRecordHistoryEnter = (props: Props) => {
  const { listRecordHistory, match, session } = props;
  const {
    params: { bid, cid, rid },
  } = match;
  if (!session.authenticated) {
    return;
  }
  listRecordHistory(bid, cid, rid);
};

export default function RecordHistory(props: Props) {
  const {
    match,
    location,
    record,
    capabilities,
    listRecordNextHistory,
    notifyError,
  } = props;

  useEffect(() => {
    onRecordHistoryEnter(props);
  }, []);

  const {
    params: { bid, cid, rid },
  } = match;
  const {
    history: { entries, loaded, hasNextPage },
  } = record;

  return (
    <div>
      <h1>
        History for{" "}
        <b>
          {bid}/{cid}/{rid}
        </b>
      </h1>
      <RecordTabs
        bid={bid}
        cid={cid}
        rid={rid}
        selected="history"
        capabilities={capabilities}
      >
        <HistoryTable
          bid={bid}
          historyLoaded={loaded}
          history={entries}
          hasNextHistory={hasNextPage}
          listNextHistory={listRecordNextHistory}
          location={location}
          notifyError={notifyError}
        />
      </RecordTabs>
    </div>
  );
}
