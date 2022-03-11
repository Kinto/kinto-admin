import type {
  CollectionRouteMatch,
  SessionState,
  BucketState,
  CollectionState,
  Capabilities,
  RecordData,
} from "../../types";
import type { Location } from "history";

import React, { PureComponent } from "react";

import { Paperclip } from "react-bootstrap-icons";
import { Pencil } from "react-bootstrap-icons";
import { Lock } from "react-bootstrap-icons";
import { Trash } from "react-bootstrap-icons";
import { SortUp } from "react-bootstrap-icons";
import { SortDown } from "react-bootstrap-icons";

import * as CollectionActions from "../../actions/collection";
import * as RouteActions from "../../actions/route";
import {
  capitalize,
  renderDisplayField,
  timeago,
  buildAttachmentUrl,
} from "../../utils";
import { canCreateRecord } from "../../permission";
import AdminLink from "../AdminLink";
import CollectionTabs from "./CollectionTabs";
import PaginatedTable from "../PaginatedTable";
import Spinner from "../Spinner";
import SignoffContainer from "../../containers/signoff/SignoffToolBar";

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

class Row extends PureComponent<RowProps> {
  static defaultProps = {
    schema: {},
    record: {},
  };

  get lastModified() {
    const lastModified = this.props.record.last_modified;
    if (!lastModified) {
      return null;
    }
    const date = new Date(lastModified);
    return date.toJSON() == null ? null : (
      <span title={date.toISOString()}>{timeago(date.getTime())}</span>
    );
  }

  onDoubleClick(event) {
    event.preventDefault();
    const { bid, cid, record, redirectTo } = this.props;
    const { id: rid } = record;
    redirectTo("record:attributes", { bid, cid, rid });
  }

  onDeleteClick(event) {
    const { bid, cid, record, deleteRecord } = this.props;
    const { id: rid, last_modified } = record;
    if (!rid) {
      // FIXME: this shouldn't be possible
      throw Error("can't happen");
    }
    if (confirm("Are you sure?")) {
      deleteRecord(bid, cid, rid, last_modified);
    }
  }

  render() {
    const { bid, cid, record, displayFields, capabilities } = this.props;
    const { id: rid } = record;
    const attachmentUrl = buildAttachmentUrl(record, capabilities);
    return (
      <tr onDoubleClick={this.onDoubleClick.bind(this)}>
        {displayFields.map((displayField, index) => {
          return (
            <td key={index}>{renderDisplayField(record, displayField)}</td>
          );
        })}
        <td className="lastmod">{this.lastModified}</td>
        <td className="actions text-right">
          <div className="btn-group">
            {attachmentUrl && (
              <a
                href={attachmentUrl}
                className="btn btn-sm btn-secondary"
                title="The record has an attachment"
                target="_blank"
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
              onClick={this.onDeleteClick.bind(this)}
              title="Delete record"
            >
              <Trash className="icon" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
}

function SortLink(props) {
  const { dir, active, column, updateSort } = props;
  return (
    <a
      href="#"
      className={`sort-link ${active ? "active badge badge-secondary" : ""}`}
      onClick={event => {
        event.preventDefault();
        if (active) {
          // Perform the opposite action from current state to make the link act
          // as a toggler.
          updateSort(dir === "up" ? `-${column}` : column);
        } else {
          // by default use ASC order
          updateSort(column);
        }
      }}
    >
      {dir === "up" ? (
        <SortUp className="icon" />
      ) : (
        <SortDown className="icon" />
      )}
    </a>
  );
}

function ColumnSortLink(props) {
  const { column, currentSort, updateSort } = props;
  if (!currentSort || column === "__json") {
    return null;
  }
  let active, direction;
  // Check if we're currently sorting on this field.
  if (new RegExp(`^-?${column}$`).test(currentSort)) {
    // We're sorting on this field; check for direction.
    active = true;
    direction = currentSort.startsWith("-") ? "down" : "up";
  } else {
    // By default, expose links to sort ASC.
    active = false;
    direction = "up";
  }
  return (
    <SortLink
      active={active}
      dir={direction}
      column={column}
      updateSort={updateSort}
    />
  );
}

type TableProps = RecordsViewProps & {
  currentSort: string;
  hasNextRecords: boolean;
  listNextRecords: typeof CollectionActions.listNextRecords;
  records: RecordData[];
  recordsLoaded: boolean;
  updateSort: (s: string) => void;
};

class Table extends PureComponent<TableProps> {
  getFieldTitle(displayField) {
    const { schema } = this.props;
    if (displayField === "__json") {
      return "Data";
    }
    if (
      this.isSchemaProperty(displayField) &&
      "title" in schema.properties[displayField]
    ) {
      return schema.properties[displayField].title;
    }
    return capitalize(displayField);
  }

  isSchemaProperty(displayField) {
    const { schema } = this.props;
    return schema && schema.properties && displayField in schema.properties;
  }

  render() {
    const {
      bid,
      cid,
      records,
      recordsLoaded,
      hasNextRecords,
      listNextRecords,
      currentSort,
      schema,
      displayFields,
      deleteRecord,
      updateSort,
      redirectTo,
      capabilities,
    } = this.props;

    if (recordsLoaded && records.length === 0) {
      return (
        <div className="alert alert-info">
          <p>This collection has no records.</p>
        </div>
      );
    }

    const thead = (
      <thead>
        <tr>
          {displayFields.map((displayField, index) => {
            return (
              <th key={index}>
                {this.getFieldTitle(displayField)}
                {this.isSchemaProperty(displayField) && (
                  <ColumnSortLink
                    currentSort={currentSort}
                    column={displayField}
                    updateSort={updateSort}
                  />
                )}
              </th>
            );
          })}
          <th>
            Last mod.
            <ColumnSortLink
              currentSort={currentSort}
              column="last_modified"
              updateSort={updateSort}
            />
          </th>
          <th />
        </tr>
      </thead>
    );

    const tbody = (
      <tbody className={!recordsLoaded ? "loading" : ""}>
        {records.map((record, index) => {
          return (
            <Row
              key={index}
              bid={bid}
              cid={cid}
              record={record}
              schema={schema}
              displayFields={displayFields}
              deleteRecord={deleteRecord}
              redirectTo={redirectTo}
              capabilities={capabilities}
            />
          );
        })}
      </tbody>
    );

    return (
      <PaginatedTable
        thead={thead}
        tbody={tbody}
        dataLoaded={recordsLoaded}
        colSpan={displayFields.length + 2}
        hasNextPage={hasNextRecords}
        listNextPage={listNextRecords}
      />
    );
  }
}

function ListActions(props) {
  const { bid, cid, session, bucket, collection } = props;
  if (session.busy || collection.busy) {
    return null;
  }
  return (
    <div className="list-actions">
      {canCreateRecord(session, bucket, collection) && (
        <>
          <AdminLink
            key="__1"
            name="record:create"
            params={{ bid, cid }}
            className="btn btn-info btn-record-add"
          >
            Create record
          </AdminLink>
          <AdminLink
            key="__2"
            name="record:bulk"
            params={{ bid, cid }}
            className="btn btn-info btn-record-bulk-add"
          >
            Bulk create
          </AdminLink>
        </>
      )}
      {/* won't render if the signer capability is not enabled on the server
       or collection not configured to be signed */}
      <SignoffContainer key="request-signoff-toolbar" />
    </div>
  );
}

export type OwnProps = {
  match: CollectionRouteMatch;
  location: Location;
};

export type StateProps = CommonStateProps & {
  session: SessionState;
  bucket: BucketState;
  collection: CollectionState;
};

export type Props = CommonProps &
  OwnProps &
  StateProps & {
    deleteRecord: typeof CollectionActions.deleteRecord;
    listRecords: typeof CollectionActions.listRecords;
    listNextRecords: typeof CollectionActions.listNextRecords;
    redirectTo: typeof RouteActions.redirectTo;
  };

export default class CollectionRecords extends PureComponent<Props> {
  static displayName = "CollectionRecords";

  updateSort = (sort: string) => {
    const { match, listRecords } = this.props;
    const {
      params: { bid, cid },
    } = match;
    listRecords(bid, cid, sort);
  };

  onCollectionRecordsEnter = () => {
    const { collection, listRecords, match, session } = this.props;
    const {
      params: { bid, cid },
    } = match;
    if (!session.authenticated) {
      // We're not authenticated, skip requesting the list of records. This likely
      // occurs when users refresh the page and lose their session.
      return;
    }
    const { currentSort } = collection;
    listRecords(bid, cid, currentSort);
  };

  componentDidMount = this.onCollectionRecordsEnter;
  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.location !== this.props.location) {
      this.onCollectionRecordsEnter();
    }
  };

  render() {
    const {
      match,
      session,
      bucket,
      collection,
      deleteRecord,
      listNextRecords,
      redirectTo,
      capabilities,
    } = this.props;
    const {
      params: { bid, cid },
    } = match;
    const {
      busy,
      data,
      currentSort,
      records,
      recordsLoaded,
      hasNextRecords,
      totalRecords,
    } = collection;
    const { schema, displayFields } = data;

    const listActions = (
      <ListActions
        bid={bid}
        cid={cid}
        bucket={bucket}
        session={session}
        collection={collection}
      />
    );

    return (
      <div className="list-page">
        <h1>
          Records of{" "}
          <b>
            {bid}/{cid}
          </b>
        </h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          selected="records"
          capabilities={capabilities}
          totalRecords={totalRecords}
        >
          {listActions}
          {busy ? (
            <Spinner />
          ) : (
            <Table
              bid={bid}
              cid={cid}
              records={records}
              recordsLoaded={recordsLoaded}
              hasNextRecords={hasNextRecords}
              listNextRecords={listNextRecords}
              currentSort={currentSort}
              schema={schema || {}}
              displayFields={displayFields || ["id", "__json"]}
              deleteRecord={deleteRecord}
              updateSort={this.updateSort}
              redirectTo={redirectTo}
              capabilities={capabilities}
            />
          )}
          {listActions}
        </CollectionTabs>
      </div>
    );
  }
}
