import React, { useState } from "react";
import type {
  BucketState,
  SessionState,
  CollectionState,
  RecordState,
  Capabilities,
} from "../../types";
import { Check2 } from "react-bootstrap-icons";
import { Trash } from "react-bootstrap-icons";
import * as CollectionActions from "../../actions/collection";
import BaseForm from "../BaseForm";
import AdminLink from "../AdminLink";
import Spinner from "../Spinner";
import JSONRecordForm from "./JSONRecordForm";
import { canCreateRecord, canEditRecord } from "../../permission";
import {
  AttachmentInfo,
  extendSchemaWithAttachment,
  extendUiSchemaWithAttachment,
} from "./AttachmentInfo";

import { RJSFSchema } from "@rjsf/utils";

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

export function extendUiSchemaWhenDisabled(uiSchema: any, disabled: boolean) {
  return { ...uiSchema, "ui:disabled": disabled };
}

type Props = {
  bid: string;
  bucket: BucketState;
  cid: string;
  rid?: string;
  session: SessionState;
  collection: CollectionState;
  record?: RecordState;
  deleteRecord?: typeof CollectionActions.deleteRecord;
  deleteAttachment?: typeof CollectionActions.deleteAttachment;
  onSubmit: (data) => void;
  capabilities: Capabilities;
};

export default function RecordForm(props: Props) {
  const [asJSON, setAsJSON] = useState(false);

  const {
    bid,
    cid,
    session,
    collection,
    record,
    deleteRecord,
    onSubmit,
    capabilities,
    bucket,
  } = props;

  const {
    data: { schema = {}, uiSchema = {}, attachment },
  } = collection;
  const attachmentConfig = {
    enabled: attachment?.enabled,
    required: attachment?.required && !record?.data?.attachment,
  };

  const allowEditing = record
    ? canEditRecord(session, bucket.data.id, collection, record)
    : canCreateRecord(session, bucket.data.id, collection);

  const handleDeleteRecord = () => {
    const { rid } = props;
    if (rid && deleteRecord && confirm("Are you sure?")) {
      deleteRecord(bid, cid, rid);
    }
  };

  const handleDeleteAttachment = () => {
    const { rid, deleteAttachment } = props;
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

  const handleOnSubmit = ({ formData }: RJSFSchema) => {
    onSubmit(formData);
  };

  const getForm = () => {
    const emptySchema = Object.keys(schema).length === 0;
    const recordData = record ? record.data : {};

    // Show a spinner if the collection metadata is being loaded, or the record
    // itself on edition.
    if (collection.busy || (record && record.busy)) {
      return <Spinner />;
    }

    const buttons = (
      <div className="row record-form-buttons">
        <div className="col-sm-6">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!allowEditing}
          >
            <Check2 className="icon" />
            {` ${record ? "Update" : "Create"} record`}
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
          {allowEditing && record && (
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
    _uiSchema = extendUiSchemaWhenDisabled(_uiSchema, !allowEditing);

    return (
      <BaseForm
        schema={_schema}
        uiSchema={_uiSchema}
        formData={recordData}
        onSubmit={handleOnSubmit}
      >
        {buttons}
      </BaseForm>
    );
  };

  const isUpdate = !!record;

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
          deleteAttachment={handleDeleteAttachment}
        />
      )}
      {getForm()}
    </div>
  );
}
