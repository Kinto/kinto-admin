import RecordTabs from "./RecordTabs";
import * as CollectionActions from "@src/actions/collection";
import { PermissionsForm } from "@src/components/PermissionsForm";
import Spinner from "@src/components/Spinner";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import { useRecord } from "@src/hooks/record";
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
  const dispatch = useAppDispatch();

  const { bid, cid, rid } = useParams<RouteParams>();
  const record = useRecord(bid, cid, rid);

  const onSubmit = ({ formData }: { formData: any }) => {
    dispatch(
      CollectionActions.updateRecord(bid, cid, rid, { permissions: formData })
    );
  };

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
        {record == undefined ? (
          <Spinner />
        ) : (
          <PermissionsForm
            permissions={record.permissions}
            acls={acls}
            readonly={!canEditRecord(session, bid, collection, rid)}
            onSubmit={onSubmit}
          />
        )}
      </RecordTabs>
    </div>
  );
}
