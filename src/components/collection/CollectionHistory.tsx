import CollectionTabs from "./CollectionTabs";
import * as CollectionActions from "@src/actions/collection";
import HistoryTable from "@src/components/HistoryTable";
import type {
  Capabilities,
  CollectionRouteMatch,
  CollectionState,
  SessionState,
} from "@src/types";
import { parseHistoryFilters } from "@src/utils";
import type { Location } from "history";
import React, { useEffect } from "react";

export type OwnProps = {
  match: CollectionRouteMatch;
  location: Location;
};

export type StateProps = {
  session: SessionState;
  collection: CollectionState;
  capabilities: Capabilities;
};

export type Props = OwnProps &
  StateProps & {
    listCollectionHistory: typeof CollectionActions.listCollectionHistory;
    listCollectionNextHistory: typeof CollectionActions.listCollectionNextHistory;
  };

export const onCollectionHistoryEnter = (props: Props) => {
  const { listCollectionHistory, match, session, location } = props;
  const {
    params: { bid, cid },
  } = match;
  const filters = parseHistoryFilters(location.search);
  if (!session.authenticated) {
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  listCollectionHistory(bid, cid, filters);
};

export default function CollectionHistory(props: Props) {
  const {
    match,
    collection,
    capabilities,
    location,
    listCollectionNextHistory,
  } = props;
  const {
    params: { bid, cid },
  } = match;
  const {
    history: { entries, loaded, hasNextPage },
  } = collection;

  useEffect(() => {
    onCollectionHistoryEnter(props);
  }, [props.location]);

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
          location={location}
        />
      </CollectionTabs>
    </div>
  );
}
