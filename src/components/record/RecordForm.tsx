import {
  AttachmentInfo,
  extendSchemaWithAttachment,
  extendUiSchemaWithAttachment,
} from "./AttachmentInfo";
import JSONRecordForm from "./JSONRecordForm";
import { RJSFSchema } from "@rjsf/utils";
import * as CollectionActions from "@src/actions/collection";
import { getClient } from "@src/client";
import AdminLink from "@src/components/AdminLink";
import BaseForm from "@src/components/BaseForm";
import Spinner from "@src/components/Spinner";
import { useCollection } from "@src/hooks/collection";
import { useRecord } from "@src/hooks/record";
import { canCreateRecord, canEditRecord } from "@src/permission";
import type { Capabilities, RecordState, SessionState } from "@src/types";
import React, { useState } from "react";
import { Check2 } from "react-bootstrap-icons";
import { Trash } from "react-bootstrap-icons";
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

type Props = {
  session: SessionState;
  record?: RecordState;
  deleteRecord?: typeof CollectionActions.deleteRecord;
  deleteAttachment?: typeof CollectionActions.deleteAttachment;
  capabilities: Capabilities;
};

export default function RecordForm(props: Props) {
  const { bid, cid, rid } = useParams();
  const [asJSON, setAsJSON] = useState(false);
  const collection = useCollection(bid, cid);
  const [cacheVal, setCacheVal] = useState(0);
  const record = useRecord(bid, cid, rid, cacheVal);
  const navigate = useNavigate();
  const isUpdate = !!record;

  if (!collection || (rid && !record)) {
    return <Spinner />;
  }

  const { session, deleteRecord, capabilities } = props;

  const { schema = {}, uiSchema = {}, attachment } = collection;
  const attachmentConfig = {
    enabled: attachment?.enabled,
    required: attachment?.required && !record?.data?.attachment, // allows records to be edited without requiring a new attachment to be uploaded
  };

  const allowEditing = record
    ? canEditRecord(session, bid, cid, rid)
    : canCreateRecord(session, bid, cid);

  const handleDeleteRecord = () => {
    if (rid && deleteRecord && confirm("Are you sure?")) {
      deleteRecord(bid, cid, rid);
    }
  };

  const handleDeleteAttachment = () => {
    const { deleteAttachment } = props;
    if (rid && deleteAttachment) {
      deleteAttachment(bid, cid, rid);
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

    if (capabilities.attachments && attachment) {
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
      col.createRecord(updatedRecord);
    }
    navigate(`/buckets/${bid}/collections/${cid}/records/`);
  };

  const getForm = () => {
    const emptySchema = Object.keys(schema).length === 0;
    const recordData = record ? record.data : {};

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
              This collection doesn't have any JSON schema defined, though you
              can create free-form records entering raw JSON.
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
          collection's UI schema
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
        You don't have the required permission to
        {isUpdate ? " edit this" : " create a"} record.
      </div>
    );

  return (
    <div>
      {alert}
      {isUpdate && attachmentConfig.enabled && (
        <AttachmentInfo
          allowEditing={allowEditing}
          capabilities={capabilities}
          record={record}
          attachmentRequired={attachment?.required}
          callback={() => {
            setCacheVal(new Date().getTime());
          }}
        />
      )}
      {getForm()}
    </div>
  );
}
