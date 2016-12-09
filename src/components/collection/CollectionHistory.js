/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  CollectionRouteParams,
  RouteLocation,
} from "../../types";

import React, { Component } from "react";

import HistoryTable from "../HistoryTable";
import CollectionTabs from "./CollectionTabs";


export default class CollectionHistory extends Component {
  props: {
    session: SessionState,
    bucket: BucketState,
    collection: CollectionState,
    capabilities: Capabilities,
    params: CollectionRouteParams,
    location: RouteLocation,
    listCollectionNextHistory: () => void,
  };

  render() {
    const {
      params,
      collection,
      capabilities,
      location,
      listCollectionNextHistory,
    } = this.props;
    const {bid, cid} = params;
    const {history, historyLoaded, hasNextHistory} = collection;

    return (
      <div>
        <h1>History for <b>{bid}/{cid}</b></h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          selected="history"
          capabilities={capabilities}>
          <HistoryTable
            bid={bid}
            historyLoaded={historyLoaded}
            history={history}
            hasNextHistory={hasNextHistory}
            listNextHistory={listCollectionNextHistory}
            location={location} />
        </CollectionTabs>
      </div>
    );
  }
}
