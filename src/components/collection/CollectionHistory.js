/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  CollectionRouteParams,
  RouteLocation,
} from "../../types";

import React, { PureComponent } from "react";

import HistoryTable from "../HistoryTable";
import CollectionTabs from "./CollectionTabs";

export default class CollectionHistory extends PureComponent {
  props: {
    session: SessionState,
    bucket: BucketState,
    collection: CollectionState,
    capabilities: Capabilities,
    params: CollectionRouteParams,
    location: RouteLocation,
    listCollectionNextHistory: () => void,
    notifyError: (message: string, error: ?Error) => void,
  };

  render() {
    const {
      params,
      collection,
      capabilities,
      location,
      listCollectionNextHistory,
      notifyError,
    } = this.props;
    const { bid, cid } = params;
    const { history: { entries, loaded, hasNextPage } } = collection;

    return (
      <div>
        <h1>History for <b>{bid}/{cid}</b></h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          selected="history"
          capabilities={capabilities}>
          <HistoryTable
            enableDiffOverview
            bid={bid}
            cid={cid}
            historyLoaded={loaded}
            history={entries}
            hasNextHistory={hasNextPage}
            listNextHistory={listCollectionNextHistory}
            location={location}
            notifyError={notifyError}
          />
        </CollectionTabs>
      </div>
    );
  }
}
