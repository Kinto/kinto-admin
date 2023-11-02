import React from "react";
import type {
  SessionState,
  BucketState,
  GroupState,
  BucketRouteMatch,
} from "../../types";

import GroupForm from "./GroupForm";
import Spinner from "../Spinner";
import * as BucketActions from "../../actions/bucket";

export type OwnProps = {
  match: BucketRouteMatch;
};

export type StateProps = {
  session: SessionState;
  bucket: BucketState;
  group: GroupState;
};

export type Props = OwnProps &
  StateProps & {
    createGroup: typeof BucketActions.createGroup;
  };

export default function GroupCreate(props: Props) {
  const { match, session, bucket, group, createGroup } = props;
  const {
    params: { bid },
  } = match;
  const { busy } = session;

  if (busy) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>
        Create a new group in <b>{bid}</b> bucket
      </h1>
      <div className="card">
        <div className="card-body">
          <GroupForm
            session={session}
            bucket={bucket}
            group={group}
            onSubmit={formData => createGroup(bid, formData)}
          />
        </div>
      </div>
    </div>
  );
}
