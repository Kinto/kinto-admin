import type { Capabilities, RecordData } from "../../types";

import React from "react";

import { Paperclip, Pencil, Lock, Trash } from "react-bootstrap-icons";

import * as CollectionActions from "../../actions/collection";
import * as RouteActions from "../../actions/route";
import { renderDisplayField, timeago, buildAttachmentUrl } from "../../utils";
import AdminLink from "../AdminLink";

type CommonStateProps = {
  capabilities: Capabilities;
};

type CommonProps = CommonStateProps & {
  deleteRecord: typeof CollectionActions.deleteRecord;
  redirectTo: typeof RouteActions.redirectTo;
};

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
          {attachmentUrl && (
            <a
              href={attachmentUrl}
              className="btn btn-sm btn-secondary"
              title="The record has an attachment"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Paperclip className="icon" />
            </a>
          )}
          <AdminLink
            name="record:attributes"
            params={{ bid, cid, rid }}
            className="btn btn-sm btn-info"
            title="Edit record"
          >
            <Pencil className="icon" />
          </AdminLink>
          <AdminLink
            name="record:permissions"
            params={{ bid, cid, rid }}
            className="btn btn-sm btn-warning"
            title="Record permissions"
          >
            <Lock className="icon" />
          </AdminLink>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={onDeleteClick}
            title="Delete record"
          >
            <Trash className="icon" />
          </button>
        </div>
      </td>
    </tr>
  );
}
