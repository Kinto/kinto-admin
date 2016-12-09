/* @flow */
import type {
  Capabilities,
  BucketState,
  BucketRouteParams,
  RouteLocation,
} from "../../types";

import React, { Component } from "react";

import BucketTabs from "./BucketTabs";
import HistoryTable from "../HistoryTable";


export default class BucketHistory extends Component {
  props: {
    params: BucketRouteParams,
    bucket: BucketState,
    capabilities: Capabilities,
    location: RouteLocation,
    listBucketNextHistory: () => void,
  };

  render() {
    const {
      params,
      bucket,
      capabilities,
      location,
      listBucketNextHistory,
    } = this.props;
    const {bid} = params;
    const {history, historyLoaded, hasNextHistory} = bucket;

    return (
      <div>
        <h1>History for <b>{bid}</b></h1>
        <BucketTabs
          bid={bid}
          selected="history"
          capabilities={capabilities}>
          <HistoryTable
            bid={bid}
            historyLoaded={historyLoaded}
            history={history}
            hasNextHistory={hasNextHistory}
            listNextHistory={listBucketNextHistory}
            location={location} />
        </BucketTabs>
      </div>
    );
  }
}
