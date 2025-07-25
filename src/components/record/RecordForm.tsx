import {
  AttachmentInfo,
  extendSchemaWithAttachment,
  extendUiSchemaWithAttachment,
} from "./AttachmentInfo";
import JSONRecordForm from "./JSONRecordForm";
import { RJSFSchema } from "@rjsf/utils";
import { getClient } from "@src/client";
import AdminLink from "@src/components/AdminLink";
import BaseForm from "@src/components/BaseForm";
import Spinner from "@src/components/Spinner";
import { useCollection } from "@src/hooks/collection";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import { useRecord } from "@src/hooks/record";
import { usePermissions, useServerInfo } from "@src/hooks/session";
import { canCreateRecord, canEditRecord } from "@src/permission";
import { LocalRecordData, RecordData } from "@src/types";
import React, { useState } from "react";
import { Check2, Trash } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router";

export function extendUIWithKintoFields(uiSchema: any, isCreate: boolean): any {
  return {
    ...uiSchema,
    id: {
      "ui:widget": "text",
      "ui:disabled": !isCreate,
      ...uiSchema.id,
    },
    last_modified: {
      "ui:widget": "hidden",
      "ui:disabled": true, // Assigned by the server
      ...uiSchema.last_modified,
    },
    schema: {
      "ui:widget": "hidden",
      "ui:disabled": true, // Assigned by the server
      ...uiSchema.schema,
    },
  };
}

export default function RecordForm() {
  const { bid, cid, rid } = useParams();
  const [asJSON, setAsJSON] = useState(false);
  const [cacheVal, setCacheVal] = useState(0);
  const collection = useCollection(bid, cid, cacheVal);
  const record = useRecord(bid, cid, rid, cacheVal);
  const permissions = usePermissions();
  const serverInfo = useServerInfo();
  const navigate = useNavigate();
  const isUpdate = !!record;

  if (!collection || (rid && !record)) {
    return <Spinner />;
  }

  const { schema = {}, uiSchema = {}, attachment } = collection;
  const collectionAttachmentEnabled = attachment?.enabled;
  const serverAttachmentEnabled = !!serverInfo?.capabilities.attachments;

  const attachmentConfig = {
    enabled: collectionAttachmentEnabled && serverAttachmentEnabled,
    required: attachment?.required && !record?.data?.attachment, // allows records to be edited without requiring a new attachment to be uploaded
  };

  const allowEditing = record
    ? canEditRecord(permissions, bid, cid, rid)
    : canCreateRecord(permissions, bid, cid);

  const handleDeleteRecord = async () => {
    if (rid && record && confirm("Are you sure?")) {
      try {
        await getClient().bucket(bid).collection(cid).deleteRecord(rid, {
          safe: true,
          last_modified: record.data.last_modified,
        });
        notifySuccess("Record deleted.");
        navigate(`/buckets/${bid}/collections/${cid}/records/`);
      } catch (ex) {
        notifyError("Couldn't delete record", ex);
      }
    }
  };

  const handleToggleJSON = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    setAsJSON(!asJSON);
  };

  const handleOnSubmit = async ({ formData }: RJSFSchema) => {
    const col = getClient().bucket(bid).collection(cid);
    const { __attachment__: attachment, ...updatedRecord } = formData;

    try {
      if (serverInfo.capabilities.attachments && attachment) {
        await col.addAttachment(
          attachment,
          { ...updatedRecord, id: rid },
          {
            safe: true,
          }
        );
      } else if (isUpdate) {
        await col.updateRecord(
          { ...updatedRecord, id: rid },
          {
            safe: true,
          }
        );
      } else {
        await col.createRecord(updatedRecord);
      }
      notifySuccess(`Record ${isUpdate ? "updated" : "created"}`);
      navigate(`/buckets/${bid}/collections/${cid}/records/`);
    } catch (ex) {
      notifyError(`Couldn't ${isUpdate ? "update" : "create"} record`, ex);
    }
  };

  const getForm = () => {
    const emptySchema = Object.keys(schema).length === 0;
    const recordData = record
      ? (record.data as RecordData)
      : ({} as LocalRecordData);

    const buttons = (
      <div className="row record-form-buttons">
        <div className="col-sm-6">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!allowEditing}
          >
            <Check2 className="icon" />
            {` ${recordData?.id ? "Update" : "Create"} record`}
          </button>
          {" or "}
          <AdminLink name="collection:records" params={{ bid, cid }}>
            Cancel
          </AdminLink>
          {emptySchema ? null : (
            <span>
              {" | "}
              <a href="#" onClick={handleToggleJSON}>
                {asJSON ? "Edit form" : "Edit raw JSON"}
              </a>
            </span>
          )}
        </div>
        <div className="col-sm-6 text-right">
          {allowEditing && recordData?.id && (
            <button
              type="button"
              className="btn btn-danger delete"
              onClick={handleDeleteRecord}
            >
              <Trash className="icon" /> Delete record
            </button>
          )}
        </div>
      </div>
    );

    if (asJSON || emptySchema) {
      return (
        <div>
          {emptySchema && (
            <div className="alert alert-warning">
              This collection doesn&apos;t have any JSON schema defined, though
              you can create free-form records entering raw JSON.
            </div>
          )}
          <JSONRecordForm
            disabled={!allowEditing}
            record={JSON.stringify(recordData, null, 2)}
            onSubmit={handleOnSubmit}
            attachmentEnabled={attachment?.enabled}
            // require an attachment on insert if attachments are required, don't need to re-upload on every edit
            attachmentRequired={attachment?.required && !record}
          >
            {buttons}
          </JSONRecordForm>
        </div>
      );
    }

    const _schema = extendSchemaWithAttachment(
      schema,
      attachmentConfig,
      recordData
    );
    let _uiSchema = extendUIWithKintoFields(uiSchema, !record);
    _uiSchema = extendUiSchemaWithAttachment(_uiSchema, attachmentConfig);

    const formCrashMsg = (
      <div>
        This is likely caused by a bad <code>ui:widget</code> value in this{" "}
        <AdminLink name="collection:attributes" params={{ bid, cid }}>
          collection&apos;s UI schema
        </AdminLink>
        .
      </div>
    );

    return (
      <BaseForm
        schema={_schema}
        uiSchema={_uiSchema}
        formData={recordData}
        onSubmit={handleOnSubmit}
        formCrashMsg={formCrashMsg}
        disabled={!allowEditing}
      >
        {buttons}
      </BaseForm>
    );
  };

  const alert =
    allowEditing || collection.busy ? null : (
      <div className="alert alert-warning">
        You don&apos;t have the required permission to
        {isUpdate ? " edit this" : " create a"} record.
      </div>
    );

  let attachmentInfo = null;
  if (collectionAttachmentEnabled) {
    if (serverAttachmentEnabled) {
      if (isUpdate) {
        attachmentInfo = (
          <AttachmentInfo
            allowEditing={allowEditing}
            capabilities={serverInfo?.capabilities}
            record={record}
            attachmentRequired={attachment?.required}
            callback={() => {
              setCacheVal(cacheVal + 1);
            }}
          />
        );
      }
    } else {
      attachmentInfo = (
        <div className="alert alert-warning">
          Attachments are not enabled on this server.
        </div>
      );
    }
  }

  return (
    <div>
      {alert}
      {attachmentInfo}
      {getForm()}
    </div>
  );
}
