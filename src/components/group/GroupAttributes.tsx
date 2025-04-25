import GroupForm from "./GroupForm";
import GroupTabs from "./GroupTabs";
import * as BucketActions from "@src/actions/bucket";
import Spinner from "@src/components/Spinner";
import { useGroup } from "@src/hooks/group";
import type {
  BucketState,
  Capabilities,
  GroupData,
  GroupRouteMatch,
  GroupState,
  SessionState,
} from "@src/types";
import React, { useCallback } from "react";
import { useParams } from "react-router";

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
};

export type Props = StateProps & {
  updateGroup: typeof BucketActions.updateGroup;
  deleteGroup: typeof BucketActions.deleteGroup;
};

export default function GroupAttributes(props: Props) {
  const { session, capabilities, updateGroup, deleteGroup } = props;
  const { bid, gid } = useParams();

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
          session={session}
          deleteGroup={onDeleteGroup}
          onSubmit={onSubmit}
        />
      </GroupTabs>
    </div>
  );
}
