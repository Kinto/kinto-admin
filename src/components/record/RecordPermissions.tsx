import RecordTabs from "./RecordTabs";
import * as CollectionActions from "@src/actions/collection";
import { PermissionsForm } from "@src/components/PermissionsForm";
import Spinner from "@src/components/Spinner";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import { useRecord } from "@src/hooks/record";
import { canEditRecord } from "@src/permission";
import React from "react";
import { useParams } from "react-router";

export function RecordPermissions() {
  const session = useAppSelector(state => state.session);
  const dispatch = useAppDispatch();
  const { bid, cid, rid } = useParams();
  const record = useRecord(bid, cid, rid);

  const onSubmit = ({ formData }: { formData: any }) => {
    dispatch(
      CollectionActions.updateRecord(bid, cid, rid, {
        data: record.data,
        permissions: formData,
      })
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
        {!record?.permissions ? (
          <Spinner />
        ) : (
          <PermissionsForm
            permissions={record.permissions}
            acls={acls}
            readonly={!canEditRecord(session, bid, cid, rid)}
            onSubmit={onSubmit}
          />
        )}
      </RecordTabs>
    </div>
  );
}
