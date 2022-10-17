import type { CollectionPermissions as CollectionPermissionsType } from "../../types";

import React from "react";

import * as BucketActions from "../../actions/bucket";
import Spinner from "../Spinner";
import CollectionTabs from "./CollectionTabs";
import { PermissionsForm } from "../PermissionsForm";
import { canEditCollection } from "../../permission";
import { useParams } from "react-router";
import { useAppSelector, useAppDispatch } from "../../hooks";
interface RouteParams {
  bid: string;
  cid: string;
}
export const CollectionPermissions = () => {
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

  if (busy) {
    return <Spinner />;
  }
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
        <PermissionsForm
          permissions={permissions}
          acls={acls}
          readonly={!canEditCollection(session, bucket, collection)}
          onSubmit={onSubmit}
        />
      </CollectionTabs>
    </div>
  );
};
