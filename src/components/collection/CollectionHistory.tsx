import CollectionTabs from "./CollectionTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useCollectionHistory } from "@src/hooks/collection";
import { parseHistoryFilters } from "@src/utils";
import React from "react";
import { useParams, useSearchParams } from "react-router";

export default function CollectionHistory() {
  const { bid, cid } = useParams();

  // History filters can be passed from URL in the collection history only.
  // Officially it's only used in the `DiffInfo` component in `SignoffToolbar`.
  // (ex. `?since=42&resource_name=record&show_signer_plugin:false`)
  const [params, _] = useSearchParams();
  const parsedFilters = parseHistoryFilters(params);
  const [filters, setFilters] = React.useState(parsedFilters);

  // Update filter handler
  function onFiltersChange(updated) {
    setFilters(prev => ({ ...prev, ...updated }));
  }

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
          initialFilters={filters}
          onFiltersChange={onFiltersChange}
        />
      </CollectionTabs>
    </div>
  );
}
