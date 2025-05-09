import { UiSchema } from "@rjsf/utils";
import { getClient } from "@src/client";
import type { Capabilities, RecordData, RecordState } from "@src/types";
import { buildAttachmentUrl, omit } from "@src/utils";
import { filesize } from "filesize";
import React from "react";
import { Paperclip } from "react-bootstrap-icons";
import { useParams } from "react-router";

export function extendSchemaWithAttachment(
  schema: any,
  attachmentConfig: { enabled: boolean; required: boolean } | null | undefined,
  record: RecordData
): any {
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

export function extendUiSchemaWithAttachment(
  uiSchema: UiSchema,
  attachmentConfig: { enabled: boolean; required: boolean } | null | undefined
): UiSchema {
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

export type AttachmentInfoProps = {
  record?: RecordState;
  allowEditing: boolean;
  attachmentRequired: boolean | null | undefined;
  capabilities: Capabilities;
  callback: () => void;
};

export function AttachmentInfo(props: AttachmentInfoProps) {
  const { bid, cid } = useParams();
  const {
    allowEditing,
    record: recordState,
    attachmentRequired,
    capabilities,
    callback,
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

  const deleteAttachment = async () => {
    await getClient().bucket(bid).collection(cid).removeAttachment(record.id);
    callback();
  };

  const FileSize: React.FC<{ bytes: number }> = ({ bytes }) => {
    return <>{filesize(bytes)}</>;
  };

  return (
    <div className="card attachment-info">
      <div className="card-header">
        <Paperclip className="icon" />
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
                <td data-testid="attachmentInfo-newSize">
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
                  <td data-testid="attachmentInfo-currentSize">
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
