import BucketTabs from "./BucketTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useBucketHistory } from "@src/hooks/bucket";
import { useShowNonHumans, useShowSignerPlugin } from "@src/hooks/preferences";
import React, { useMemo } from "react";
import { useParams } from "react-router";

export default function BucketHistory() {
  const { bid } = useParams();

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

  const history = useBucketHistory(bid, filters);

  return (
    <div>
      <h1>
        History for <b>{bid}</b>
      </h1>
      <BucketTabs bid={bid} selected="history">
        <HistoryTable
          bid={bid}
          historyLoaded={!!history.data}
          history={history.data ?? []}
          hasNextHistory={history.hasNextPage}
          listNextHistory={history.next}
          showNonHumans={showNonHumans}
          showSignerPlugin={showSignerPlugin}
          // Persist filter changes and reload table (memo dependencies)
          onShowSignerPluginChange={setShowSignerPlugin}
          onShowNonHumansChange={setShowNonHumans}
        />
      </BucketTabs>
    </div>
  );
}
