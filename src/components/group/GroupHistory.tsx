import CollectionTabs from "./GroupTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useGroupHistory } from "@src/hooks/group";
import { useShowNonHumans, useShowSignerPlugin } from "@src/hooks/preferences";
import React, { useMemo } from "react";
import { useParams } from "react-router";

export default function GroupHistory() {
  const { bid, gid } = useParams();

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

  const history = useGroupHistory(bid, gid, filters);

  return (
    <div>
      <h1>
        History for{" "}
        <b>
          {bid}/{gid}
        </b>
      </h1>
      <CollectionTabs bid={bid} gid={gid} selected="history">
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
      </CollectionTabs>
    </div>
  );
}
