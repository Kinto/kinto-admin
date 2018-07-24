/* @flow */
import type {
  Capabilities,
  GroupState,
  GroupRouteMatch,
  SessionState,
} from "../../types";
import type { Location } from "react-router-dom";

import React, { PureComponent } from "react";
import { parse } from "query-string";

import HistoryTable from "../HistoryTable";
import CollectionTabs from "./GroupTabs";

type Props = {
  match: GroupRouteMatch,
  group: GroupState,
  capabilities: Capabilities,
  location: Location,
  hasNextHistory: boolean,
  listGroupHistory: ?Function,
  listGroupNextHistory: ?Function,
  notifyError: (message: string, error: ?Error) => void,
  location: Location,
  session: SessionState,
};

export const onGroupHistoryEnter = (props: Props) => {
  const { match, listGroupHistory, session, location } = props;
  const {
    params: { bid, gid },
  } = match;
  const filters = parse(location.search);
  if (!session.authenticated) {
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  listGroupHistory && listGroupHistory(bid, gid, filters);
};

export default class GroupHistory extends PureComponent<Props> {
  componentDidMount = () => onGroupHistoryEnter(this.props);
  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.location !== this.props.location) {
      onGroupHistoryEnter(this.props);
    }
  };

  render() {
    const {
      match,
      group,
      capabilities,
      location,
      listGroupNextHistory,
      notifyError,
    } = this.props;
    const {
      params: { bid, gid },
    } = match;
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
