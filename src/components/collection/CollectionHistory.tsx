import CollectionTabs from "./CollectionTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useCollectionHistory } from "@src/hooks/collection";
import type { Capabilities, CollectionState, SessionState } from "@src/types";
import { parseHistoryFilters } from "@src/utils";
import React from "react";
import { useParams, useSearchParams } from "react-router";

export type StateProps = {
  capabilities: Capabilities;
};

export default function CollectionHistory(props: StateProps) {
  const { bid, cid } = useParams();
  const [params, setParams] = useSearchParams();
  const filters = parseHistoryFilters(params);
  const history = useCollectionHistory(bid, cid, filters);

  const { capabilities } = props;

  return (
    <div>
      <h1>
        History for{" "}
        <b>
          {bid}/{cid}
        </b>
      </h1>
      <CollectionTabs
        bid={bid}
        cid={cid}
        selected="history"
        capabilities={capabilities}
      >
        <HistoryTable
          enableDiffOverview
          bid={bid}
          cid={cid}
          historyLoaded={history.data !== undefined}
          history={history.data || []}
          hasNextHistory={history.hasNextPage}
          listNextHistory={history.next}
        />
      </CollectionTabs>
    </div>
  );
}
