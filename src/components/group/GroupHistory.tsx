import CollectionTabs from "./GroupTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useGroupHistory } from "@src/hooks/group";
import React from "react";
import { useParams } from "react-router";

export default function GroupHistory() {
  const { bid, gid } = useParams();

  const [filters, setFilters] = React.useState({});
  // Refetch from the server when filters change.
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
          onFiltersChange={setFilters}
        />
      </CollectionTabs>
    </div>
  );
}
