/* @flow */
import type {
  Capabilities,
  GroupState,
  GroupRouteParams,
  RouteLocation,
  SessionState,
} from "../../types";
import type { Location } from "react-router-dom";

import React, { PureComponent } from "react";

import HistoryTable from "../HistoryTable";
import CollectionTabs from "./GroupTabs";

type Props = {
  params: GroupRouteParams,
  group: GroupState,
  capabilities: Capabilities,
  location: RouteLocation,
  hasNextHistory: boolean,
  listGroupHistory: ?Function,
  listGroupNextHistory: ?Function,
  notifyError: (message: string, error: ?Error) => void,
  location: Location,
  session: SessionState,
  routing: Object,
};

export default class GroupHistory extends PureComponent<Props> {
  onGroupHistoryEnter() {
    const { params, listGroupHistory, session, routing } = this.props;
    const { bid, gid } = params;
    const {
      locationBeforeTransitions: { query: filters },
    } = routing;
    if (!session.authenticated) {
      // We're not authenticated, skip requesting the list of records. This likely
      // occurs when users refresh the page and lose their session.
      return;
    }
    listGroupHistory && listGroupHistory(bid, gid, filters);
  }

  componentDidMount = this.onGroupHistoryEnter;
  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.location !== this.props.location) {
      this.onGroupHistoryEnter();
    }
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
    const {
      history: { entries, loaded, hasNextPage },
    } = group;

    return (
      <div>
        <h1>
          History for{" "}
          <b>
            {bid}/{gid}
          </b>
        </h1>
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
