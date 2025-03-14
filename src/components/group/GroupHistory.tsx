import CollectionTabs from "./GroupTabs";
import * as GroupActions from "@src/actions/group";
import * as NotificationActions from "@src/actions/notifications";
import HistoryTable from "@src/components/HistoryTable";
import type {
  Capabilities,
  GroupRouteMatch,
  GroupState,
  SessionState,
} from "@src/types";
import type { Location } from "history";
import React, { useEffect } from "react";

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
    return;
  }
  if (listGroupHistory) {
    listGroupHistory(bid, gid);
  }
};

export default function GroupHistory(props: Props) {
  const {
    match,
    group,
    capabilities,
    location,
    listGroupNextHistory,
    notifyError,
  } = props;

  useEffect(() => {
    onGroupHistoryEnter(props);
  }, []);

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
