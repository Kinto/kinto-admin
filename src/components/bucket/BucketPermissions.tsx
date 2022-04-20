import type { BucketPermissions as BucketPermissionsType } from "../../types";

import React from "react";

import * as BucketActions from "../../actions/bucket";
import Spinner from "../Spinner";
import BucketTabs from "./BucketTabs";
import { PermissionsForm } from "../PermissionsForm";
import { canEditBucket } from "../../permission";
import { useParams } from "react-router";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../hooks";

export const BucketPermissions = () => {
  const dispatch = useDispatch();
  const { bid } = useParams<{ bid: string }>();
  const session = useAppSelector(store => store.session);
  const bucket = useAppSelector(store => store.bucket);
  const onSubmit = ({ formData }: { formData: BucketPermissionsType }) => {
    dispatch(BucketActions.updateBucket(bid, { permissions: formData }));
  };

  const { busy, permissions } = bucket;
  const acls = ["read", "write", "collection:create", "group:create"];
  if (busy) {
    return <Spinner />;
  }
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
        <PermissionsForm
          permissions={permissions}
          acls={acls}
          readonly={!canEditBucket(session, bucket)}
          onSubmit={onSubmit}
        />
      </BucketTabs>
    </div>
  );
};
