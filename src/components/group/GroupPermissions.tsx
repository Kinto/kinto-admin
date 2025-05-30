import GroupTabs from "./GroupTabs";
import { getClient } from "@src/client";
import { PermissionsForm } from "@src/components/PermissionsForm";
import Spinner from "@src/components/Spinner";
import { useAppSelector } from "@src/hooks/app";
import { useGroup } from "@src/hooks/group";
import { canEditGroup } from "@src/permission";
import type { GroupPermissions as GroupPermissionsType } from "@src/types";
import React, { useState } from "react";
import { useParams } from "react-router";

export function GroupPermissions() {
  const { bid, gid } = useParams();
  const [cacheVal, setCacheVal] = useState(0);
  const group = useGroup(bid, gid, cacheVal);
  const session = useAppSelector(state => state.session);

  const onSubmit = async ({ formData }: { formData: GroupPermissionsType }) => {
    await getClient().bucket(bid).updateGroup(group.data, {
      permissions: formData,
      last_modified: group.data.last_modified,
      safe: true,
    });
    setCacheVal(cacheVal + 1);
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
      <GroupTabs bid={bid} gid={gid} selected="permissions">
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
