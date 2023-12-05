import type {
  GroupPermissions as GroupPermissionsType,
  GroupPermissionsRouteMatchParams,
} from "../../types";

import React from "react";

import * as BucketActions from "../../actions/bucket";
import Spinner from "../Spinner";
import GroupTabs from "./GroupTabs";
import { PermissionsForm } from "../PermissionsForm";
import { canEditGroup } from "../../permission";
import { useAppSelector, useAppDispatch } from "../../hooks/app";
import { useParams } from "react-router";

export function GroupPermissions() {
  const group = useAppSelector(state => state.group);
  const bucket = useAppSelector(state => state.bucket);
  const { busy, permissions } = group;
  const session = useAppSelector(state => state.session);
  const { bid, gid } = useParams<GroupPermissionsRouteMatchParams>();
  const dispatch = useAppDispatch();

  const onSubmit = ({ formData }: { formData: GroupPermissionsType }) => {
    dispatch(BucketActions.updateGroup(bid, gid, { permissions: formData }));
  };
  if (busy) {
    return <Spinner />;
  }
  return (
    <div>
      <h1>
        Edit{" "}
        <b>
          {bid}/{gid} group
        </b>{" "}
        group permissions
      </h1>
      <GroupTabs
        bid={bid}
        gid={gid}
        capabilities={session.serverInfo.capabilities}
        selected="permissions"
      >
        <PermissionsForm
          permissions={permissions}
          acls={["read", "write"]}
          readonly={!canEditGroup(session, bucket.data.id, group)}
          onSubmit={onSubmit}
        />
      </GroupTabs>
    </div>
  );
}
