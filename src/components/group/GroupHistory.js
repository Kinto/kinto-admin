/* @flow */
import type {
  Capabilities,
  GroupState,
  GroupRouteParams,
  RouteLocation,
} from "../../types";

import React, { Component } from "react";

import Spinner from "../Spinner";
import HistoryTable from "../HistoryTable";
import CollectionTabs from "./GroupTabs";


export default class GroupHistory extends Component {
  props: {
    params: GroupRouteParams,
    group: GroupState,
    capabilities: Capabilities,
    location: RouteLocation,
  };

  render() {
    const {params, group, capabilities, location} = this.props;
    const {bid, gid} = params;
    const {history, historyLoaded} = group;

    return (
      <div>
        <h1>History for <b>{bid}/{gid}</b></h1>
        <CollectionTabs
          bid={bid}
          gid={gid}
          selected="history"
          capabilities={capabilities}>
          { !historyLoaded ? <Spinner /> :
            <HistoryTable bid={bid} history={history} location={location} />}
        </CollectionTabs>
      </div>
    );
  }
}
