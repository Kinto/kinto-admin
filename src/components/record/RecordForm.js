/* @flow */
import type {
  SessionState,
  BucketState,
  CollectionState,
  RecordState,
  RecordData,
  Capabilities,
} from "../../types";

import React, { PureComponent } from "react";
import filesize from "filesize";

import BaseForm from "./../BaseForm";
import AdminLink from "../AdminLink";
import Spinner from "../Spinner";
import JSONRecordForm from "./JSONRecordForm";
import { canCreateRecord, canEditRecord } from "../../permission";
import { cleanRecord, linkify, buildAttachmentUrl } from "../../utils";

export function extendSchemaWithAttachment(
  schema: Object,
  attachmentConfig: ?{ enabled: boolean, required: boolean },
  edit: boolean = false
): Object {
  if (!attachmentConfig || !attachmentConfig.enabled) {
    return schema;
  }
  const schemaRequired = schema.required || [];
  const required = attachmentConfig.required && !edit
    ? schemaRequired.concat("__attachment__")
    : schemaRequired;
  return {
    ...schema,
    required,
    properties: {
      ...schema.properties,
      __attachment__: {
        type: "string",
        format: "data-url",
        title: "File attachment",
      },
    },
  };
}

export function extendUiSchemaWithAttachment(
  uiSchema: Object,
  attachmentConfig: ?{ enabled: boolean, required: boolean }
): Object {
  if (
    !attachmentConfig ||
    !attachmentConfig.enabled ||
    !uiSchema.hasOwnProperty("ui:order")
  ) {
    return uiSchema;
  }
  return {
    ...uiSchema,
    "ui:order": [...uiSchema["ui:order"], "__attachment__"],
  };
}

export function extendUiSchemaWhenDisabled(
  uiSchema: Object,
  disabled: boolean
) {
  return { ...uiSchema, "ui:disabled": disabled };
}

function AttachmentPreview({ mimetype, location }) {
  if (!mimetype.startsWith("image/")) {
    return null;
  } else {
    return (
      <div className="attachment-img">
        <a href={location} target="_blank"><img src={location} /></a>
      </div>
    );
  }
}

type AttachmentInfoProps = {
  record?: RecordState,
  attachmentRequired: ?boolean,
  deleteAttachment: () => void,
  capabilities: Capabilities,
};

function AttachmentInfo(props: AttachmentInfoProps) {
  const {
    record: recordState,
    attachmentRequired,
    deleteAttachment,
    capabilities,
  } = props;
  if (recordState == null) {
    return null;
  }
  const { data: record } = recordState;
  const { attachment } = record;
  if (!attachment) {
    return null;
  }
  return (
    <div className="panel panel-default attachment-info">
      <div className="panel-heading">
        <i className="glyphicon glyphicon-paperclip" />
        <b>Attachment information</b>
      </div>
      <div className="panel-body">
        {attachmentRequired &&
          <div className="alert alert-warning">
            <p>
              An attachment is required for records in this collection. To
              replace current attachment, use the <i>File attachment</i> field
              below.
            </p>
          </div>}
        <AttachmentPreview
          mimetype={attachment.mimetype}
          location={buildAttachmentUrl(record, capabilities)}
        />
        <table className="table table-condensed">
          <tbody>
            <tr>
              <th>Location</th>
              <td>{linkify(attachment.location)}</td>
            </tr>
            <tr>
              <th>Filename</th>
              <td>{attachment.filename}</td>
            </tr>
            <tr>
              <th>Size</th>
              <td>{filesize(attachment.size)}</td>
            </tr>
            <tr>
              <th>Hash</th>
              <td>{attachment.hash}</td>
            </tr>
            <tr>
              <th>Mime-Type</th>
              <td>{attachment.mimetype}</td>
            </tr>
          </tbody>
        </table>
        {!attachmentRequired &&
          <p className="text-right attachment-action">
            <input
              type="button"
              onClick={deleteAttachment}
              className="btn btn-danger"
              value="Delete this attachment"
            />
          </p>}
      </div>
    </div>
  );
}

export default class RecordForm extends PureComponent {
  props: {
    bid: string,
    cid: string,
    rid?: string,
    session: SessionState,
    bucket: BucketState,
    collection: CollectionState,
    record?: RecordState,
    deleteRecord?: (bid: string, cid: string, rid: string) => void,
    deleteAttachment?: (bid: string, cid: string, rid: string) => void,
    onSubmit: (data: RecordData) => void,
    capabilities: Capabilities,
  };

  state: {
    asJSON: boolean,
  };

  constructor(props: Object) {
    super(props);
    this.state = { asJSON: false };
  }

  onSubmit = ({ formData }: { formData: Object }) => {
    this.props.onSubmit(formData);
  };

  get allowEditing(): boolean {
    const { session, bucket, collection, record } = this.props;
    if (record) {
      return canEditRecord(session, bucket, collection, record);
    } else {
      return canCreateRecord(session, bucket, collection);
    }
  }

  deleteRecord = () => {
    const { deleteRecord, bid, cid, rid } = this.props;
    if (rid && deleteRecord && confirm("Are you sure?")) {
      deleteRecord(bid, cid, rid);
    }
  };

  getForm() {
    const { asJSON } = this.state;
    const { bid, cid, collection, record } = this.props;
    const { data: { schema = {}, uiSchema = {}, attachment } } = collection;
    const recordData = (record && record.data) || {};
    const emptySchema = Object.keys(schema).length === 0;

    if (record && record.busy) {
      return <Spinner />;
    }

    const buttons = (
      <div className="row record-form-buttons">
        <div className="col-sm-6">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!this.allowEditing}>
            <i className="glyphicon glyphicon-ok" />
            {` ${record ? "Update" : "Create"} record`}
          </button>
          {" or "}
          <AdminLink name="collection:records" params={{ bid, cid }}>
            Cancel
          </AdminLink>
          {emptySchema
            ? null
            : <span>
                {" | "}
                <a href="#" onClick={this.toggleJSON}>
                  {asJSON ? "Edit form" : "Edit raw JSON"}
                </a>
              </span>}
        </div>
        <div className="col-sm-6 text-right">
          {this.allowEditing &&
            record &&
            <button
              type="button"
              className="btn btn-danger delete"
              onClick={this.deleteRecord}>
              <i className="glyphicon glyphicon-trash" />{" "}
              Delete record
            </button>}
        </div>
      </div>
    );

    if (asJSON || emptySchema) {
      return (
        <div>
          {emptySchema &&
            <div className="alert alert-warning">
              This collection doesn't have any JSON schema defined, though you can
              create free-form records entering raw JSON.
            </div>}
          <JSONRecordForm
            disabled={!this.allowEditing}
            record={JSON.stringify(cleanRecord(recordData), null, 2)}
            onSubmit={this.onSubmit}>
            {buttons}
          </JSONRecordForm>
        </div>
      );
    }

    const _schema = extendSchemaWithAttachment(schema, attachment, !!record);
    let _uiSchema = extendUiSchemaWithAttachment(uiSchema, attachment);
    _uiSchema = extendUiSchemaWhenDisabled(_uiSchema, !this.allowEditing);

    return (
      <BaseForm
        schema={_schema}
        uiSchema={_uiSchema}
        formData={cleanRecord(recordData)}
        onSubmit={this.onSubmit}>
        {buttons}
      </BaseForm>
    );
  }

  deleteAttachment = () => {
    const { bid, cid, rid, deleteAttachment } = this.props;
    if (rid && deleteAttachment) {
      deleteAttachment(bid, cid, rid);
    }
  };

  toggleJSON = (event: Event) => {
    event.preventDefault();
    this.setState({ asJSON: !this.state.asJSON });
  };

  render() {
    const { collection, record, capabilities } = this.props;
    const { data: { attachment: attachmentConfig } } = collection;
    const attachmentRequired = attachmentConfig && attachmentConfig.required;
    const creation = !record;

    const alert = this.allowEditing || collection.busy
      ? null
      : <div className="alert alert-warning">
          You don't have the required permission to
          {creation ? " create a" : " edit this"} record.
        </div>;

    return (
      <div>
        {alert}
        {creation &&
          <AttachmentInfo
            capabilities={capabilities}
            record={record}
            attachmentRequired={attachmentRequired}
            deleteAttachment={this.deleteAttachment}
          />}
        {this.getForm()}
      </div>
    );
  }
}
