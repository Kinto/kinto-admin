import RecordTabs from "./RecordTabs";
import * as CollectionActions from "@src/actions/collection";
import { PermissionsForm } from "@src/components/PermissionsForm";
import Spinner from "@src/components/Spinner";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import { canEditRecord } from "@src/permission";
import React from "react";
import { useParams } from "react-router";

interface RouteParams {
  bid: string;
  cid: string;
  rid: string;
}
export function RecordPermissions() {
  const session = useAppSelector(state => state.session);
  const collection = useAppSelector(state => state.collection);
  const record = useAppSelector(state => state.record);
  const dispatch = useAppDispatch();
  const { bid, cid, rid } = useParams<RouteParams>();

  const onSubmit = ({ formData }: { formData: any }) => {
    dispatch(
      CollectionActions.updateRecord(bid, cid, rid, { permissions: formData })
    );
  };
  const { busy, permissions } = record;
  const acls = ["read", "write"];
  return (
    <div>
      <h1>
        Edit{" "}
        <b>
          {bid}/{cid}/{rid}
        </b>{" "}
        record permissions
      </h1>
      <RecordTabs
        bid={bid}
        cid={cid}
        rid={rid}
        capabilities={session.serverInfo.capabilities}
        selected="permissions"
      >
        {busy ? (
          <Spinner />
        ) : (
          <PermissionsForm
            permissions={permissions}
            acls={acls}
            readonly={!canEditRecord(session, bid, collection, record)}
            onSubmit={onSubmit}
          />
        )}
      </RecordTabs>
    </div>
  );
}
