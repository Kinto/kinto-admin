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

import Spinner from "../Spinner";
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
  };

  render() {
    const {params, collection, capabilities, location} = this.props;
    const {bid, cid} = params;
    const {history, historyLoaded} = collection;

    return (
      <div>
        <h1>History for <b>{bid}/{cid}</b></h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          selected="history"
          capabilities={capabilities}>
          { !historyLoaded ? <Spinner /> :
            <HistoryTable bid={bid} history={history} location={location} />}
        </CollectionTabs>
      </div>
    );
  }
}
