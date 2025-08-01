import CollectionTabs from "./CollectionTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useCollectionHistory } from "@src/hooks/collection";
import { useShowNonHumans, useShowSignerPlugin } from "@src/hooks/preferences";
import { useServerInfo } from "@src/hooks/session";
import { parseHistoryFilters } from "@src/utils";
import React from "react";
import { useParams, useSearchParams } from "react-router";

export default function CollectionHistory() {
  const { bid, cid } = useParams();

  // History filters can be passed from URL
  const [params, _] = useSearchParams();
  const filters = parseHistoryFilters(params);

  // But users can toggle them, and their choice is persisted
  const [showSignerPlugin, setShowSignerPluging] = useShowSignerPlugin(
    filters.show_signer_plugin ?? true
  );
  const [showNonHumans, setShowNonHumans] = useShowNonHumans(
    filters.show_non_humans ?? true
  );
  filters.show_signer_plugin = showSignerPlugin;
  filters.show_non_humans = showNonHumans;

  // Refetch from the server when filters change.
  const history = useCollectionHistory(bid, cid, filters);

  // Hide the non human filters if the server does not support openid or signer
  const serverInfo = useServerInfo();
  const hasOpenID = serverInfo && "openid" in serverInfo.capabilities;
  const hasSigner = serverInfo && "signer" in serverInfo.capabilities;

  return (
    <div>
      <h1>
        History for{" "}
        <b>
          {bid}/{cid}
        </b>
      </h1>
      <CollectionTabs bid={bid} cid={cid} selected="history">
        {hasOpenID && (
          <div className="form-check form-check-inline mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={showNonHumans}
              onChange={e => setShowNonHumans(e.currentTarget.checked)}
              id="showNonHumans"
              data-testid="showNonHumans"
            />
            <label className="form-check-label" htmlFor="showNonHumans">
              Show non humans entries
            </label>
          </div>
        )}
        {hasSigner && (
          <div className="form-check form-check-inline mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={showSignerPlugin && showNonHumans}
              onChange={e => setShowSignerPluging(e.currentTarget.checked)}
              id="showSignerPlugin"
              data-testid="showSignerPlugin"
              disabled={!showNonHumans}
            />
            <label className="form-check-label" htmlFor="showSignerPlugin">
              Show plugin entries
            </label>
          </div>
        )}
        <HistoryTable
          enableDiffOverview
          bid={bid}
          cid={cid}
          historyLoaded={history.data !== undefined}
          history={history.data || []}
          hasNextHistory={history.hasNextPage}
          listNextHistory={history.next}
          sinceFilter={filters.since}
        />
      </CollectionTabs>
    </div>
  );
}
