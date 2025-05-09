import { CommonProps } from "./commonPropTypes";
import AdminLink from "@src/components/AdminLink";
import { useAppSelector } from "@src/hooks/app";
import type { RecordData } from "@src/types";
import { buildAttachmentUrl, renderDisplayField, timeago } from "@src/utils";
import React from "react";
import { Dropdown } from "react-bootstrap";
import {
  ClipboardCheck,
  Lock,
  Paperclip,
  Pencil,
  Trash,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router";

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
  deleteRecord,
}: RowProps) {
  const navigate = useNavigate();
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
    navigate(`/buckets/${bid}/collections/${cid}/records/${rid}/attributes`);
  };

  const onDeleteClick = (event: React.MouseEvent) => {
    const { id: rid, last_modified } = record;
    if (!rid) {
      // FIXME: this shouldn't be possible
      throw Error("can't happen");
    }
    if (window.confirm("Are you sure?")) {
      deleteRecord(rid, last_modified);
    }
  };

  const attachmentUrl = buildAttachmentUrl(record, capabilities);
  const { id: rid } = record;

  return (
    <tr onDoubleClick={onDoubleClick} data-testid={`${rid}-row`}>
      {displayFields.map((displayField, index) => (
        <td key={index} data-testid={`${rid}-${displayField}`}>
          {renderDisplayField(record, displayField)}
        </td>
      ))}
      <td className="lastmod">{lastModified()}</td>
      <td className="actions text-right" data-testid={`${rid}-actions`}>
        <AdminLink
          name="record:attributes"
          params={{ bid, cid, rid }}
          className="btn btn-sm btn-info"
          style={{
            margin: "1pt",
          }}
          title="Edit record"
        >
          <Pencil className="icon" />
        </AdminLink>
        <button
          type="button"
          className="btn btn-sm btn-danger"
          style={{
            margin: "1pt",
          }}
          onClick={onDeleteClick}
          title="Delete record"
        >
          <Trash className="icon" />
        </button>
        <Dropdown
          style={{
            display: "inline",
          }}
        >
          <Dropdown.Toggle
            variant="secondary"
            className="btn-sm"
            style={{
              margin: "1pt",
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
              <Lock className="icon" /> Edit Permissions
            </AdminLink>
            <Dropdown.Item
              onClick={() => {
                navigator.clipboard.writeText(
                  `${session.auth.server}/buckets/${bid}/collections/${cid}/records/${record.id}`
                );
              }}
            >
              <ClipboardCheck className="icon" /> Copy Link to Clipboard
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </td>
    </tr>
  );
}
