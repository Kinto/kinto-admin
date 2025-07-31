import RecordTabs from "./RecordTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useRecordHistory } from "@src/hooks/record";
import React from "react";
import { useParams } from "react-router";

export default function RecordHistory() {
  const { bid, cid, rid } = useParams();
  const history = useRecordHistory(bid, cid, rid);

  return (
    <div>
      <h1>
        History for{" "}
        <b>
          {bid}/{cid}/{rid}
        </b>
      </h1>
      <RecordTabs bid={bid} cid={cid} rid={rid} selected="history">
        <HistoryTable
          bid={bid}
          historyLoaded={history.data !== undefined}
          history={history.data ?? []}
          hasNextHistory={history.hasNextPage}
          listNextHistory={history.next}
        />
      </RecordTabs>
    </div>
  );
}
