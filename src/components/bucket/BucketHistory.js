/* @flow */
import type {
  BucketState,
  RouteParams,
  RouteLocation,
} from "../../types";

import React, { Component } from "react";

import Spinner from "../Spinner";
import BucketTabs from "./BucketTabs";
import HistoryTable from "../HistoryTable";


export default class BucketHistory extends Component {
  props: {
    params: RouteParams,
    bucket: BucketState,
    capabilities: Object,
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
          { !historyLoaded ? <Spinner /> :
            <HistoryTable bid={bid} history={history} location={location} />}
        </BucketTabs>
      </div>
    );
  }
}
