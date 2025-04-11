import RecordTabs from "./RecordTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useRecordHistory } from "@src/hooks/record";
import type { Capabilities, RecordRouteMatch, SessionState } from "@src/types";
import type { Location } from "history";
import React from "react";

export type OwnProps = {
  match: RecordRouteMatch;
  location: Location;
};

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
};

export type Props = OwnProps & StateProps;

export default function RecordHistory(props: Props) {
  const { match, location, capabilities } = props;

  const {
    params: { bid, cid, rid },
  } = match;

  const history = useRecordHistory(bid, cid, rid);

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
          historyLoaded={history.data !== undefined}
          history={history.data || []}
          hasNextHistory={history.hasNextPage}
          listNextHistory={history.next}
          location={location}
        />
      </RecordTabs>
    </div>
  );
}
