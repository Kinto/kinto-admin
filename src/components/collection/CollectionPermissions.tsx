import CollectionTabs from "./CollectionTabs";
import { getClient } from "@src/client";
import { PermissionsForm } from "@src/components/PermissionsForm";
import Spinner from "@src/components/Spinner";
import { reloadBuckets } from "@src/hooks/bucket";
import { useCollection, useCollectionPermissions } from "@src/hooks/collection";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import { usePermissions } from "@src/hooks/session";
import { canEditCollection } from "@src/permission";
import type { CollectionPermissions as CollectionPermissionsType } from "@src/types";
import React, { useState } from "react";
import { useParams } from "react-router";

export function CollectionPermissions() {
  const { bid, cid } = useParams();
  const [cacheVal, setCacheVal] = useState(0);
  const collection = useCollection(bid, cid, cacheVal);
  const userPermissions = usePermissions();
  const collectionPermissions = useCollectionPermissions(bid, cid, cacheVal);
  const acls = ["read", "write", "record:create"];

  const onSubmit = async ({
    formData,
  }: {
    formData: CollectionPermissionsType;
  }) => {
    try {
      await getClient().bucket(bid).collection(cid).setPermissions(formData, {
        safe: true,
        last_modified: collection.last_modified,
      });
      notifySuccess("Collection permissions updated.");
      setCacheVal(cacheVal + 1);
      reloadBuckets();
    } catch (ex) {
      notifyError("Couldn't update collection permissions", ex);
    }
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
        {!collectionPermissions ? (
          <Spinner />
        ) : (
          <PermissionsForm
            permissions={collectionPermissions}
            acls={acls}
            readonly={!canEditCollection(userPermissions, bid, cid)}
            onSubmit={onSubmit}
          />
        )}
      </CollectionTabs>
    </div>
  );
}
