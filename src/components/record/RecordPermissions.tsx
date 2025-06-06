import RecordTabs from "./RecordTabs";
import { getClient } from "@src/client";
import { PermissionsForm } from "@src/components/PermissionsForm";
import Spinner from "@src/components/Spinner";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import { useRecord } from "@src/hooks/record";
import { usePermissions } from "@src/hooks/session";
import { canEditRecord } from "@src/permission";
import React, { useState } from "react";
import { useParams } from "react-router";

export function RecordPermissions() {
  const [cacheVal, setCacheVal] = useState(0);
  const { bid, cid, rid } = useParams();
  const userPermissions = usePermissions();
  const record = useRecord(bid, cid, rid, cacheVal);

  const onSubmit = async ({ formData }: { formData: any }) => {
    try {
      await getClient().bucket(bid).collection(cid).updateRecord(record.data, {
        permissions: formData,
        safe: true,
        last_modified: record.data.last_modified,
      });
      notifySuccess("Record permissions updated.");
      setCacheVal(cacheVal + 1);
    } catch (ex) {
      notifyError("Couldn't update record permissions", ex);
    }
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
      <RecordTabs bid={bid} cid={cid} rid={rid} selected="permissions">
        {!record?.permissions ? (
          <Spinner />
        ) : (
          <PermissionsForm
            permissions={record.permissions}
            acls={acls}
            readonly={!canEditRecord(userPermissions, bid, cid, rid)}
            onSubmit={onSubmit}
          />
        )}
      </RecordTabs>
    </div>
  );
}
