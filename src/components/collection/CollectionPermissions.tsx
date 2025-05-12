import CollectionTabs from "./CollectionTabs";
import { listBuckets } from "@src/actions/session";
import { getClient } from "@src/client";
import { PermissionsForm } from "@src/components/PermissionsForm";
import Spinner from "@src/components/Spinner";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import { useCollection, useCollectionPermissions } from "@src/hooks/collection";
import { notifySuccess } from "@src/hooks/notifications";
import { canEditCollection } from "@src/permission";
import type { CollectionPermissions as CollectionPermissionsType } from "@src/types";
import React, { useState } from "react";
import { useParams } from "react-router";

export function CollectionPermissions() {
  const { bid, cid } = useParams();
  const [cacheVal, setCacheVal] = useState(0);
  const session = useAppSelector(state => state.session);
  const collection = useCollection(bid, cid, cacheVal);
  const permissions = useCollectionPermissions(bid, cid, cacheVal);
  const acls = ["read", "write", "record:create"];
  const dispatch = useAppDispatch();

  const onSubmit = async ({
    formData,
  }: {
    formData: CollectionPermissionsType;
  }) => {
    await getClient().bucket(bid).collection(cid).setPermissions(formData, {
      safe: true,
      last_modified: collection.last_modified,
    });
    notifySuccess("Collection permissions updated.");
    setCacheVal(cacheVal + 1);
    dispatch(listBuckets());
  };

  return (
    <div>
      <h1>
        Edit{" "}
        <b>
          {bid}/{cid} collection
        </b>{" "}
        collection permissions
      </h1>
      <CollectionTabs bid={bid} cid={cid} selected="permissions">
        {!permissions ? (
          <Spinner />
        ) : (
          <PermissionsForm
            permissions={permissions}
            acls={acls}
            readonly={!canEditCollection(session, bid, cid)}
            onSubmit={onSubmit}
          />
        )}
      </CollectionTabs>
    </div>
  );
}
