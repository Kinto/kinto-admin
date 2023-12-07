import React from "react";

import type { RecordData } from "../../types";

import { Dropdown } from "react-bootstrap";

import {
  ClipboardCheck,
  Paperclip,
  Pencil,
  Lock,
  Trash,
} from "react-bootstrap-icons";
import { renderDisplayField, timeago, buildAttachmentUrl } from "../../utils";
import AdminLink from "../AdminLink";
import { CommonProps } from "./commonPropTypes";
import { useAppSelector } from "../../hooks/app";

type RecordsViewProps = CommonProps & {
  bid: string;
  cid: string;
  displayFields: string[];
  schema: any;
};

type RowProps = RecordsViewProps & {
  record: RecordData;
};

export default function RecordRow({
  bid,
  cid,
  record,
  displayFields,
  capabilities,
  redirectTo,
  deleteRecord,
  schema = {},
}: RowProps) {
  const session = useAppSelector(state => state.session);

  const lastModified = () => {
    const lastModified = record.last_modified;
    if (!lastModified) {
      return null;
    }
    const date = new Date(lastModified);
    return date.toJSON() == null ? null : (
      <span title={date.toISOString()}>{timeago(date.getTime())}</span>
    );
  };

  const onDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const { id: rid } = record;
    redirectTo("record:attributes", { bid, cid, rid });
  };

  const onDeleteClick = (event: React.MouseEvent) => {
    const { id: rid, last_modified } = record;
    if (!rid) {
      // FIXME: this shouldn't be possible
      throw Error("can't happen");
    }
    if (window.confirm("Are you sure?")) {
      deleteRecord(bid, cid, rid, last_modified);
    }
  };

  const attachmentUrl = buildAttachmentUrl(record, capabilities);
  const { id: rid } = record;

  return (
    <tr onDoubleClick={onDoubleClick}>
      {displayFields.map((displayField, index) => (
        <td key={index}>{renderDisplayField(record, displayField)}</td>
      ))}
      <td className="lastmod">{lastModified()}</td>
      <td className="actions text-right">
        <div className="btn-group">
          <AdminLink
            name="record:attributes"
            params={{ bid, cid, rid }}
            className="btn btn-sm btn-info"
            title="Edit record"
          >
            <Pencil className="icon" />
          </AdminLink>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={onDeleteClick}
            title="Delete record"
          >
            <Trash className="icon" />
          </button>

          <Dropdown>
            <Dropdown.Toggle
              variant="secondary"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
            />
            <Dropdown.Menu>
              {attachmentUrl && (
                <a
                  href={attachmentUrl}
                  className="dropdown-item"
                  title="The record has an attachment"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Paperclip className="icon" /> View Attachment
                </a>
              )}
              <AdminLink
                name="record:permissions"
                params={{ bid, cid, rid }}
                className="dropdown-item"
              >
                <Lock className="icon" /> Record Permissions
              </AdminLink>
              <Dropdown.Item
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${session.auth.server}buckets/${bid}/collections/${cid}/records/${record.id}`
                  );
                }}
              >
                <ClipboardCheck className="icon" /> Copy link to clipboard
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </td>
    </tr>
  );
}
