import RecordTabs from "./RecordTabs";
import * as RecordActions from "@src/actions/record";
import HistoryTable from "@src/components/HistoryTable";
import { useRecord, useRecordHistory } from "@src/hooks/record";
import type {
  Capabilities,
  RecordRouteMatch,
  RecordState,
  SessionState,
} from "@src/types";
import React, { useEffect } from "react";
import { useParams } from "react-router";

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
  record: RecordState;
};

export type Props = StateProps & {
  listRecordHistory: typeof RecordActions.listRecordHistory;
  listRecordNextHistory: typeof RecordActions.listRecordNextHistory;
};

export default function RecordHistory(props: Props) {
  const { bid, cid, rid } = useParams();
  const history = useRecordHistory(bid, cid, rid);
  const { capabilities } = props;

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
        />
      </RecordTabs>
    </div>
  );
}
