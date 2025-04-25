import Spinner from "../Spinner";
import BucketTabs from "./BucketTabs";
import { DataList, ListActions } from "./GroupDataList";
import { useGroupList } from "@src/hooks/group";
import type {
  BucketRouteMatch,
  BucketState,
  Capabilities,
  SessionState,
} from "@src/types";
import React from "react";
import { useParams } from "react-router";

type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
};

type Props = StateProps;

export default function BucketCollections({ session, capabilities }: Props) {
  const { bid } = useParams();
  const groups = useGroupList(bid);

  const listActions = (
    <ListActions bid={bid} session={session} busy={!groups} />
  );

  return (
    <div className="list-page">
      <h1>
        Groups of <b>{bid}</b>
      </h1>
      <BucketTabs bid={bid} selected="groups" capabilities={capabilities}>
        {listActions}
        {groups && groups.length === 0 ? (
          <div className="alert alert-info">
            <p>This bucket has no groups.</p>
          </div>
        ) : (
          <DataList
            bid={bid}
            groups={groups}
            capabilities={capabilities}
            showSpinner={!groups}
          />
        )}
        {listActions}
      </BucketTabs>
    </div>
  );
}
