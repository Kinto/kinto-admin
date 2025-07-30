import CollectionTabs from "./CollectionTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useCollectionHistory } from "@src/hooks/collection";
import {
  useExcludeNonHumans,
  useExcludeSignerPlugin,
} from "@src/hooks/preferences";
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
  const [excludeSignerPlugin, setExcludeSignerPlugin] = useExcludeSignerPlugin(
    filters.exclude_signer_plugin
  );
  const [excludeNonHumans, setExcludeNonHumans] = useExcludeNonHumans(
    filters.exclude_non_humans
  );
  filters.exclude_signer_plugin = excludeSignerPlugin;
  filters.exclude_non_humans = excludeNonHumans;

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
              checked={excludeNonHumans}
              onChange={e => setExcludeNonHumans(e.currentTarget.checked)}
              id="excludeNonHumans"
              data-testid="excludeNonHumans"
            />
            <label className="form-check-label" htmlFor="excludeNonHumans">
              Exclude non humans
            </label>
          </div>
        )}
        {hasSigner && (
          <div className="form-check form-check-inline mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={excludeNonHumans || excludeSignerPlugin}
              onChange={e => setExcludeSignerPlugin(e.currentTarget.checked)}
              id="excludeSignerPlugin"
              data-testid="excludeSignerPlugin"
              disabled={excludeNonHumans}
            />
            <label className="form-check-label" htmlFor="excludeSignerPlugin">
              Exclude signer plugin
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
