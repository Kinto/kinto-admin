import BucketTabs from "./BucketTabs";
import { getClient } from "@src/client";
import { PermissionsForm } from "@src/components/PermissionsForm";
import Spinner from "@src/components/Spinner";
import { useAppSelector } from "@src/hooks/app";
import { useBucket, useBucketPermissions } from "@src/hooks/bucket";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import { canEditBucket } from "@src/permission";
import type { BucketPermissions as BucketPermissionsType } from "@src/types";
import React, { useState } from "react";
import { useParams } from "react-router";

export function BucketPermissions() {
  const { bid } = useParams();
  const [cacheVal, setCacheVal] = useState(0);
  const session = useAppSelector(store => store.session);
  const bucket = useBucket(bid, cacheVal);
  const permissions = useBucketPermissions(bid, cacheVal);

  const onSubmit = async ({
    formData,
  }: {
    formData: BucketPermissionsType;
  }) => {
    try {
      await getClient().bucket(bid).setPermissions(formData, {
        safe: true,
        last_modified: bucket.last_modified,
      });
      notifySuccess("Bucket permissions updated.");
      setCacheVal(cacheVal + 1);
    } catch (ex) {
      notifyError("Couldn't save bucket permissions", ex);
    }
  };

  const acls = ["read", "write", "collection:create", "group:create"];
  return (
    <div>
      <h1>
        Edit <b>{bid}</b> bucket permissions
      </h1>
      <BucketTabs bid={bid} selected="permissions">
        {!permissions ? (
          <Spinner />
        ) : (
          <PermissionsForm
            permissions={permissions}
            acls={acls}
            readonly={!canEditBucket(session, bid)}
            onSubmit={onSubmit}
          />
        )}
      </BucketTabs>
    </div>
  );
}
