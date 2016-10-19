/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  RecordState,
  RecordRouteParams,
  RouteLocation,
} from "../../types";

import React, { Component } from "react";

import Spinner from "../Spinner";
import HistoryTable from "../HistoryTable";
import RecordTabs from "./RecordTabs";


export default class RecordHistory extends Component {
  props: {
    params: RecordRouteParams,
    session: SessionState,
    capabilities: Capabilities,
    bucket: BucketState,
    record: RecordState,
    location: RouteLocation,
  };

  render() {
    const {params, record, capabilities, location} = this.props;
    const {bid, cid, rid} = params;
    const {history, historyLoaded} = record;

    return (
      <div>
        <h1>History for <b>{bid}/{cid}/{rid}</b></h1>
        <RecordTabs
          bid={bid}
          cid={cid}
          rid={rid}
          selected="history"
          capabilities={capabilities}>
          { !historyLoaded ? <Spinner /> :
            <HistoryTable bid={bid} history={history} location={location} />}
        </RecordTabs>
      </div>
    );
  }
}
