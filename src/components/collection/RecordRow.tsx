import HumanDate from "../HumanDate";
import { CommonProps } from "./commonPropTypes";
import AdminLink from "@src/components/AdminLink";
import { useAuth } from "@src/hooks/session";
import type { RecordData } from "@src/types";
import { buildAttachmentUrl, renderDisplayField } from "@src/utils";
import React from "react";
import { Dropdown } from "react-bootstrap";
import {
  ClipboardCheck,
  ClockHistory,
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
  deleteRecord: (rid: string, last_modified: number) => void;
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
  const auth = useAuth();

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
      <td className="lastmod">
        <HumanDate timestamp={record.last_modified} />
      </td>
      <td className="actions" data-testid={`${rid}-actions`}>
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
          <Dropdown.Menu
            style={{
              margin: "0px 1.7em 0px 0px",
            }}
          >
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
              name="record:history"
              params={{ bid, cid, rid }}
              className="dropdown-item"
            >
              <ClockHistory className="icon" /> History
            </AdminLink>
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
                  `${auth.server}/buckets/${bid}/collections/${cid}/records/${record.id}`
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
