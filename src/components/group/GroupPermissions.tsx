import GroupTabs from "./GroupTabs";
import * as BucketActions from "@src/actions/bucket";
import { PermissionsForm } from "@src/components/PermissionsForm";
import Spinner from "@src/components/Spinner";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import { useGroup } from "@src/hooks/group";
import { canEditGroup } from "@src/permission";
import type {
  GroupPermissionsRouteMatchParams,
  GroupPermissions as GroupPermissionsType,
} from "@src/types";
import React from "react";
import { useParams } from "react-router";

export function GroupPermissions() {
  const { bid, gid } = useParams();
  const group = useGroup(bid, gid);
  const session = useAppSelector(state => state.session);

  const dispatch = useAppDispatch();

  const onSubmit = ({ formData }: { formData: GroupPermissionsType }) => {
    dispatch(BucketActions.updateGroup(bid, gid, { permissions: formData }));
  };
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
        {!group ? (
          <Spinner />
        ) : (
          <PermissionsForm
            permissions={group.permissions}
            acls={["read", "write"]}
            readonly={!canEditGroup(session, bid, gid)}
            onSubmit={onSubmit}
          />
        )}
      </GroupTabs>
    </div>
  );
}
