import BucketTabs from "./BucketTabs";
import * as BucketActions from "@src/actions/bucket";
import { PermissionsForm } from "@src/components/PermissionsForm";
import Spinner from "@src/components/Spinner";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import { canEditBucket } from "@src/permission";
import type { BucketPermissions as BucketPermissionsType } from "@src/types";
import React from "react";
import { useParams } from "react-router";

export function BucketPermissions() {
  const dispatch = useAppDispatch();
  const { bid } = useParams<{ bid: string }>();
  const session = useAppSelector(store => store.session);
  const bucket = useAppSelector(store => store.bucket);
  const onSubmit = ({ formData }: { formData: BucketPermissionsType }) => {
    dispatch(BucketActions.updateBucket(bid, { permissions: formData }));
  };

  const { busy, permissions } = bucket;
  const acls = ["read", "write", "collection:create", "group:create"];
  return (
    <div>
      <h1>
        Edit <b>{bid}</b> bucket permissions
      </h1>
      <BucketTabs
        bid={bid}
        capabilities={session.serverInfo.capabilities}
        selected="permissions"
      >
        {busy ? (
          <Spinner />
        ) : (
          <PermissionsForm
            permissions={permissions}
            acls={acls}
            readonly={!canEditBucket(session, bucket.data.id)}
            onSubmit={onSubmit}
          />
        )}
      </BucketTabs>
    </div>
  );
}
