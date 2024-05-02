import CollectionTabs from "./CollectionTabs";
import * as BucketActions from "@src/actions/bucket";
import { PermissionsForm } from "@src/components/PermissionsForm";
import Spinner from "@src/components/Spinner";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import { canEditCollection } from "@src/permission";
import type { CollectionPermissions as CollectionPermissionsType } from "@src/types";
import React from "react";
import { useParams } from "react-router";

interface RouteParams {
  bid: string;
  cid: string;
}

export function CollectionPermissions() {
  const { bid, cid } = useParams<RouteParams>();
  const session = useAppSelector(state => state.session);
  const bucket = useAppSelector(state => state.bucket);
  const collection = useAppSelector(state => state.collection);
  const { busy, permissions } = collection;
  const acls = ["read", "write", "record:create"];
  const dispatch = useAppDispatch();

  const onSubmit = ({ formData }: { formData: CollectionPermissionsType }) => {
    dispatch(
      BucketActions.updateCollection(bid, cid, { permissions: formData })
    );
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
      <CollectionTabs
        bid={bid}
        cid={cid}
        capabilities={session.serverInfo.capabilities}
        selected="permissions"
      >
        {busy ? (
          <Spinner />
        ) : (
          <PermissionsForm
            permissions={permissions}
            acls={acls}
            readonly={!canEditCollection(session, bucket.data.id, collection)}
            onSubmit={onSubmit}
          />
        )}
      </CollectionTabs>
    </div>
  );
}
