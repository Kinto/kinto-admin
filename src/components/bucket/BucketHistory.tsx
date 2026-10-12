import BucketTabs from "./BucketTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useBucketHistory } from "@src/hooks/bucket";
import { useState } from "react";
import { useParams } from "react-router";

export default function BucketHistory() {
  const { bid } = useParams();

  const [filters, setFilters] = useState({});
  // Refetch from the server when filters change.
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
          onFiltersChange={setFilters}
        />
      </BucketTabs>
    </div>
  );
}
