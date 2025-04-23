import CollectionTabs from "./CollectionTabs";
import * as CollectionActions from "@src/actions/collection";
import HistoryTable from "@src/components/HistoryTable";
import type { Capabilities, CollectionState, SessionState } from "@src/types";
import { parseHistoryFilters } from "@src/utils";
import React, { useEffect } from "react";
import { useParams, useSearchParams } from "react-router";

export type StateProps = {
  session: SessionState;
  collection: CollectionState;
  capabilities: Capabilities;
};

export type Props = StateProps & {
  listCollectionHistory: typeof CollectionActions.listCollectionHistory;
  listCollectionNextHistory: typeof CollectionActions.listCollectionNextHistory;
};

export default function CollectionHistory(props: Props) {
  const { bid, cid } = useParams();
  const [params, setParams] = useSearchParams();

  const {
    collection,
    capabilities,
    listCollectionHistory,
    listCollectionNextHistory,
    session,
  } = props;

  const {
    history: { entries, loaded, hasNextPage },
  } = collection;

  const onCollectionHistoryEnter = () => {
    if (!session.authenticated) {
      // We're not authenticated, skip requesting the list of records. This likely
      // occurs when users refresh the page and lose their session.
      return;
    }
    const filters = parseHistoryFilters(params);
    listCollectionHistory(bid, cid, filters);
  };

  useEffect(() => {
    onCollectionHistoryEnter();
  }, [bid, cid, ...params]);

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
          historyLoaded={loaded}
          history={entries}
          hasNextHistory={hasNextPage}
          listNextHistory={listCollectionNextHistory}
        />
      </CollectionTabs>
    </div>
  );
}
