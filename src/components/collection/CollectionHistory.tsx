import CollectionTabs from "./CollectionTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useCollectionHistory } from "@src/hooks/collection";
import { useShowNonHumans, useShowSignerPlugin } from "@src/hooks/preferences";
import { parseHistoryFilters } from "@src/utils";
import React, { useMemo } from "react";
import { useParams, useSearchParams } from "react-router";

export default function CollectionHistory() {
  const { bid, cid } = useParams();

  // History filters can be passed from URL
  const [params, _] = useSearchParams();
  const initialFilters = parseHistoryFilters(params);

  // Restore preferences (use querystring by default)
  const [showSignerPlugin, setShowSignerPlugin] = useShowSignerPlugin(
    initialFilters.show_signer_plugin ?? true
  );
  const [showNonHumans, setShowNonHumans] = useShowNonHumans(
    initialFilters.show_non_humans ?? true
  );

  // Create filters object from current state
  const filters = useMemo(
    () => ({
      ...initialFilters,
      show_signer_plugin: showSignerPlugin,
      show_non_humans: showNonHumans,
    }),
    [initialFilters, showSignerPlugin, showNonHumans]
  );

  // Refetch from the server when filters change.
  const history = useCollectionHistory(bid, cid, filters);

  return (
    <div>
      <h1>
        History for{" "}
        <b>
          {bid}/{cid}
        </b>
      </h1>
      <CollectionTabs bid={bid} cid={cid} selected="history">
        <HistoryTable
          enableDiffOverview
          bid={bid}
          cid={cid}
          historyLoaded={history.data !== undefined}
          history={history.data ?? []}
          hasNextHistory={history.hasNextPage}
          listNextHistory={history.next}
          sinceFilter={filters.since}
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
