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

import { ReactComponent as Check2Icon } from "bootstrap-icons/icons/check2.svg";
import { ReactComponent as TrashIcon } from "bootstrap-icons/icons/trash.svg";
import { ReactComponent as PaperclipIcon } from "bootstrap-icons/icons/paperclip.svg";

import * as CollectionActions from "../../actions/collection";
import BaseForm from "./../BaseForm";
import AdminLink from "../AdminLink";
import Spinner from "../Spinner";
import JSONRecordForm from "./JSONRecordForm";
import { canCreateRecord, canEditRecord } from "../../permission";
import { buildAttachmentUrl, omit } from "../../utils";

export function extendSchemaWithAttachment(
  schema: Object,
  attachmentConfig: ?{ enabled: boolean, required: boolean },
  record: RecordData
): Object {
  if (!attachmentConfig || !attachmentConfig.enabled) {
    return schema;
  }
  const isCreate = !record.id;
  const attachmentMissing = record.attachment && record.attachment.location;

  // We add a fake schema field ``__attachment__`` for the file input.
  // It will be required if the
  // Attachment form field is only required to receive a file
  // required, when creating a record, or updating it if it does not have any.
  // (required setting changed in the mean time).
  const schemaRequired = schema.required || [];
  const required =
    attachmentConfig.required && (isCreate || attachmentMissing)
      ? schemaRequired.concat("__attachment__")
      : schemaRequired;

  // On forms, there is no need to have the "attachment" attribute fields. They
  // are shown in the attachment infos, and all assigned by the server automatically
  // on file upload.
  let schemaProperties = omit(schema.properties, ["attachment"]);

  return {
    ...schema,
    required,
    properties: {
      ...schemaProperties,
      __attachment__: {
        type: "string",
        format: "data-url",
        title: "File attachment",
      },
    },
  };
}

export function extendUIWithKintoFields(
  uiSchema: Object,
  isCreate: boolean
): Object {
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

export function extendUiSchemaWithAttachment(
  uiSchema: Object,
  attachmentConfig: ?{ enabled: boolean, required: boolean }
): Object {
  if (
    !attachmentConfig ||
    !attachmentConfig.enabled ||
    !Object.prototype.hasOwnProperty.call(uiSchema, "ui:order")
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
        <a href={location} target="_blank">
          <img src={location} />
        </a>
      </div>
    );
  }
}

type AttachmentInfoProps = {
  record?: RecordState,
  allowEditing: boolean,
  attachmentRequired: ?boolean,
  deleteAttachment: () => void,
  capabilities: Capabilities,
};

function AttachmentInfo(props: AttachmentInfoProps) {
  const {
    allowEditing,
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

  const attachmentURL = buildAttachmentUrl(record, capabilities);

  const FileSize = ({ bytes }) => filesize(bytes);

  return (
    <div className="card attachment-info">
      <div className="card-header">
        <PaperclipIcon className="icon" />
        <b>Attachment information</b>
      </div>
      <div className="card-body">
        {allowEditing && attachmentRequired && (
          <div className="alert alert-warning">
            <p>
              An attachment is required for records in this collection. To
              replace current attachment, use the <i>File attachment</i> field
              below.
            </p>
          </div>
        )}
        <div className="attachment-attributes">
          <table className="table table-condensed">
            <tbody>
              <tr>
                <th>Location</th>
                <td>
                  <a href={attachmentURL} target="_blank">
                    {attachment.location}
                  </a>
                </td>
              </tr>
              <tr>
                <th>Filename</th>
                <td>{attachment.filename}</td>
              </tr>
              <tr>
                <th>Size</th>
                <td>
                  <FileSize bytes={attachment.size} />
                </td>
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
          {attachment.original && (
            <table className="table table-condensed">
              <tbody>
                <tr>
                  <th>Pre-gzipped file</th>
                  <td />
                </tr>
                <tr>
                  <td>{attachment.original.filename}</td>
                </tr>
                <tr>
                  <td>
                    <FileSize bytes={attachment.original.size} />
                  </td>
                </tr>
                <tr>
                  <td>{attachment.original.hash}</td>
                </tr>
                <tr>
                  <td>{attachment.original.mimetype}</td>
                </tr>
              </tbody>
            </table>
          )}
          <div>
            <AttachmentPreview
              mimetype={attachment.mimetype}
              location={attachmentURL}
            />
            {!attachmentRequired && (
              <p className="text-right attachment-action">
                <input
                  type="button"
                  onClick={deleteAttachment}
                  className="btn btn-danger"
                  value="Delete this attachment"
                />
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type Props = {
  bid: string,
  cid: string,
  rid?: string,
  session: SessionState,
  bucket: BucketState,
  collection: CollectionState,
  record?: RecordState,
  deleteRecord?: typeof CollectionActions.deleteRecord,
  deleteAttachment?: typeof CollectionActions.deleteAttachment,
  onSubmit: (data: RecordData) => void,
  capabilities: Capabilities,
};

type State = {
  asJSON: boolean,
};

export default class RecordForm extends PureComponent<Props, State> {
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
    const {
      data: { schema = {}, uiSchema = {}, attachment },
    } = collection;
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
            disabled={!this.allowEditing}>
            <Check2Icon className="icon" />
            {` ${record ? "Update" : "Create"} record`}
          </button>
          {" or "}
          <AdminLink name="collection:records" params={{ bid, cid }}>
            Cancel
          </AdminLink>
          {emptySchema ? null : (
            <span>
              {" | "}
              <a href="#" onClick={this.toggleJSON}>
                {asJSON ? "Edit form" : "Edit raw JSON"}
              </a>
            </span>
          )}
        </div>
        <div className="col-sm-6 text-right">
          {this.allowEditing && record && (
            <button
              type="button"
              className="btn btn-danger delete"
              onClick={this.deleteRecord}>
              <TrashIcon className="icon" /> Delete record
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
            disabled={!this.allowEditing}
            record={JSON.stringify(recordData, null, 2)}
            onSubmit={this.onSubmit}>
            {buttons}
          </JSONRecordForm>
        </div>
      );
    }

    const _schema = extendSchemaWithAttachment(schema, attachment, recordData);
    let _uiSchema = extendUIWithKintoFields(uiSchema, !record);
    _uiSchema = extendUiSchemaWithAttachment(_uiSchema, attachment);
    _uiSchema = extendUiSchemaWhenDisabled(_uiSchema, !this.allowEditing);

    return (
      <BaseForm
        schema={_schema}
        uiSchema={_uiSchema}
        formData={recordData}
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
    const {
      data: { attachment: attachmentConfig },
    } = collection;
    const attachmentRequired = attachmentConfig && attachmentConfig.required;
    const isUpdate = !!record;

    const alert =
      this.allowEditing || collection.busy ? null : (
        <div className="alert alert-warning">
          You don't have the required permission to
          {isUpdate ? " edit this" : " create a"} record.
        </div>
      );

    return (
      <div>
        {alert}
        {isUpdate && (
          <AttachmentInfo
            allowEditing={this.allowEditing}
            capabilities={capabilities}
            record={record}
            attachmentRequired={attachmentRequired}
            deleteAttachment={this.deleteAttachment}
          />
        )}
        {this.getForm()}
      </div>
    );
  }
}
