import CollectionTabs from "./CollectionTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useCollectionHistory } from "@src/hooks/collection";
import { parseHistoryFilters } from "@src/utils";
import React from "react";
import { useParams, useSearchParams } from "react-router";

export default function CollectionHistory() {
  const { bid, cid } = useParams();
  const [params, _] = useSearchParams();
  const filters = parseHistoryFilters(params);
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
          history={history.data || []}
          hasNextHistory={history.hasNextPage}
          listNextHistory={history.next}
          sinceFilter={filters.since}
        />
      </CollectionTabs>
    </div>
  );
}
