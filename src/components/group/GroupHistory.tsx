import type {
  Capabilities,
  GroupState,
  GroupRouteMatch,
  SessionState,
} from "../../types";
import type { Location } from "history";

import React, { PureComponent } from "react";

import * as GroupActions from "../../actions/group";
import * as NotificationActions from "../../actions/notifications";
import HistoryTable from "../HistoryTable";
import CollectionTabs from "./GroupTabs";

export type OwnProps = {
  match: GroupRouteMatch;
  location: Location;
};

export type StateProps = {
  group: GroupState;
  capabilities: Capabilities;
  session: SessionState;
};

export type Props = OwnProps &
  StateProps & {
    listGroupHistory: typeof GroupActions.listGroupHistory;
    listGroupNextHistory: typeof GroupActions.listGroupNextHistory;
    notifyError: typeof NotificationActions.notifyError;
  };

export const onGroupHistoryEnter = (props: Props) => {
  const { match, listGroupHistory, session } = props;
  const {
    params: { bid, gid },
  } = match;
  if (!session.authenticated) {
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  listGroupHistory && listGroupHistory(bid, gid);
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
          capabilities={capabilities}
        >
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
