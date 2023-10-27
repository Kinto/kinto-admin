import React, { useCallback } from "react";
import type {
  Capabilities,
  SessionState,
  BucketState,
  GroupState,
  GroupData,
  GroupRouteMatch,
} from "../../types";

import Spinner from "../Spinner";
import GroupForm from "./GroupForm";
import GroupTabs from "./GroupTabs";
import * as BucketActions from "../../actions/bucket";

export type OwnProps = {
  match: GroupRouteMatch;
};

export type StateProps = {
  session: SessionState;
  bucket: BucketState;
  group: GroupState;
  capabilities: Capabilities;
};

export type Props = OwnProps &
  StateProps & {
    updateGroup: typeof BucketActions.updateGroup;
    deleteGroup: typeof BucketActions.deleteGroup;
  };

export default function GroupAttributes(props: Props) {
  const {
    match,
    session,
    bucket,
    group,
    capabilities,
    updateGroup,
    deleteGroup,
  } = props;
  const {
    params: { bid, gid },
  } = match;
  const { busy, data: formData } = group;

  const onSubmit = useCallback(
    (formData: GroupData) => {
      updateGroup(bid, gid, { data: formData });
    },
    [bid, gid, updateGroup]
  );

  const onDeleteGroup = useCallback(
    (gid: string) => {
      if (window.confirm("This will delete the group. Are you sure?")) {
        deleteGroup(bid, gid);
      }
    },
    [bid, deleteGroup]
  );

  if (busy || formData == null) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>
        Edit{" "}
        <b>
          {bid}/{gid}
        </b>{" "}
        group attributes
      </h1>
      <GroupTabs
        bid={bid}
        gid={gid}
        selected="attributes"
        capabilities={capabilities}
      >
        <GroupForm
          bid={bid}
          gid={gid}
          session={session}
          bucket={bucket}
          group={group}
          deleteGroup={onDeleteGroup}
          formData={formData}
          onSubmit={onSubmit}
        />
      </GroupTabs>
    </div>
  );
}
