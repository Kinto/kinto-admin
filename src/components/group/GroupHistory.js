/* @flow */
import type {
  Capabilities,
  GroupState,
  GroupRouteParams,
  RouteLocation,
} from "../../types";

import React, { PureComponent } from "react";

import HistoryTable from "../HistoryTable";
import CollectionTabs from "./GroupTabs";

export default class GroupHistory extends PureComponent {
  props: {
    params: GroupRouteParams,
    group: GroupState,
    capabilities: Capabilities,
    location: RouteLocation,
    hasNextHistory: boolean,
    listGroupNextHistory: ?Function,
    notifyError: (message: string, error: ?Error) => void,
  };

  render() {
    const {
      params,
      group,
      capabilities,
      location,
      listGroupNextHistory,
      notifyError,
    } = this.props;
    const { bid, gid } = params;
    const { history: { entries, loaded, hasNextPage } } = group;

    return (
      <div>
        <h1>History for <b>{bid}/{gid}</b></h1>
        <CollectionTabs
          bid={bid}
          gid={gid}
          selected="history"
          capabilities={capabilities}>
          <HistoryTable
            bid={bid}
            historyLoaded={loaded}
            history={entries}
            hasNextHistory={hasNextPage}
            listNextHistory={listGroupNextHistory}
            location={location}
            notifyError={notifyError}
          />
        </CollectionTabs>
      </div>
    );
  }
}
