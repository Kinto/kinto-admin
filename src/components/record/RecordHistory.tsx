import RecordTabs from "./RecordTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useShowNonHumans, useShowSignerPlugin } from "@src/hooks/preferences";
import { useRecordHistory } from "@src/hooks/record";
import React, { useMemo } from "react";
import { useParams } from "react-router";

export default function RecordHistory() {
  const { bid, cid, rid } = useParams();

  // Restore preferences
  const [showSignerPlugin, setShowSignerPlugin] = useShowSignerPlugin(true);
  const [showNonHumans, setShowNonHumans] = useShowNonHumans(true);

  // Create filters object from current state
  const filters = useMemo(
    () => ({
      show_signer_plugin: showSignerPlugin,
      show_non_humans: showNonHumans,
    }),
    [showSignerPlugin, showNonHumans]
  );

  const history = useRecordHistory(bid, cid, rid, filters);

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
          showNonHumans={showNonHumans}
          showSignerPlugin={showSignerPlugin}
          // Persist filter changes and reload table (memo dependencies)
          onShowSignerPluginChange={setShowSignerPlugin}
          onShowNonHumansChange={setShowNonHumans}
        />
      </RecordTabs>
    </div>
  );
}
