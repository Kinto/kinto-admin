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
  };

  render() {
    const {params, bucket, capabilities, location} = this.props;
    const {bid} = params;
    const {history, historyLoaded} = bucket;

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
            location={location} />
        </BucketTabs>
      </div>
    );
  }
}
