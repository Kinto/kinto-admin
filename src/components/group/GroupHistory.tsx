import CollectionTabs from "./GroupTabs";
import HistoryTable from "@src/components/HistoryTable";
import { useListHistory } from "@src/hooks/group";
import type {
  Capabilities,
  GroupRouteMatch,
  GroupState,
  SessionState,
} from "@src/types";
import React from "react";
import { useParams } from "react-router";

export type OwnProps = {
  match: GroupRouteMatch;
};

export type StateProps = {
  capabilities: Capabilities;
};

export type Props = OwnProps & StateProps;

export default function GroupHistory({ capabilities }: Props) {
  const { bid, gid } = useParams();

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
        />
      </CollectionTabs>
    </div>
  );
}
