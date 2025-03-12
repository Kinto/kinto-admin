import CollectionTabs from "./GroupTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useListHistory } from "@src/hooks/group";
import type {
  Capabilities,
  GroupRouteMatch,
  GroupState,
  SessionState,
} from "@src/types";
import type { Location } from "history";
import React from "react";

export type OwnProps = {
  match: GroupRouteMatch;
  location: Location;
};

export type StateProps = {
  group: GroupState;
  capabilities: Capabilities;
  session: SessionState;
};

export type Props = OwnProps & StateProps;

export default function GroupHistory(props: Props) {
  const {
    capabilities,
    location,
    match: {
      params: { bid, gid },
    },
  } = props;

  const history = useListHistory(bid, gid);

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
          historyLoaded={history.data !== undefined}
          history={history.data || []}
          hasNextHistory={history.hasNextPage}
          listNextHistory={history.next}
          location={location}
        />
      </CollectionTabs>
    </div>
  );
}
