/* @flow */
import type {
  CollectionRouteParams,
  SessionState,
  BucketState,
  CollectionState,
  Capabilities,
} from "../../types";

import React, { PureComponent } from "react";

import { renderDisplayField, timeago, buildAttachmentUrl } from "../../utils";
import { canCreateRecord } from "../../permission";
import AdminLink from "../AdminLink";
import CollectionTabs from "./CollectionTabs";
import PaginatedTable from "../PaginatedTable";

class Row extends PureComponent {
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
    return date.toJSON() == null
      ? null
      : <span title={date.toISOString()}>{timeago(date.getTime())}</span>;
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
            {attachmentUrl &&
              <a
                href={attachmentUrl}
                className="btn btn-sm btn-default"
                title="The record has an attachment"
                target="_blank">
                <i className="glyphicon glyphicon-paperclip" />
              </a>}
            <AdminLink
              name="record:attributes"
              params={{ bid, cid, rid }}
              className="btn btn-sm btn-info"
              title="Edit record">
              <i className="glyphicon glyphicon-pencil" />
            </AdminLink>
            <AdminLink
              name="record:permissions"
              params={{ bid, cid, rid }}
              className="btn btn-sm btn-warning"
              title="Record permissions">
              <i className="glyphicon glyphicon-lock" />
            </AdminLink>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={this.onDeleteClick.bind(this)}
              title="Delete record">
              <i className="glyphicon glyphicon-trash" />
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
      className={`sort-link ${active ? "active label label-default" : ""}`}
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
      }}>
      <i className={`glyphicon glyphicon-menu-${dir}`} />
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

class Table extends PureComponent {
  getFieldTitle(displayField) {
    const { schema } = this.props;
    if (displayField === "__json") {
      return "JSON";
    }
    if (
      this.isSchemaProperty(displayField) &&
      "title" in schema.properties[displayField]
    ) {
      return schema.properties[displayField].title;
    }
    return displayField;
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
                {this.isSchemaProperty(displayField) &&
                  <ColumnSortLink
                    currentSort={currentSort}
                    column={displayField}
                    updateSort={updateSort}
                  />}
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
  const { bid, cid, session, bucket, collection, hooks = [] } = props;
  if (session.busy || collection.busy) {
    return null;
  }
  const defaultButtons = [
    <AdminLink
      key="__1"
      name="record:create"
      params={{ bid, cid }}
      className="btn btn-info btn-record-add">
      Create
    </AdminLink>,
    <AdminLink
      key="__2"
      name="record:bulk"
      params={{ bid, cid }}
      className="btn btn-info btn-record-bulk-add">
      Bulk create
    </AdminLink>,
  ];
  return (
    <div className="list-actions">
      {canCreateRecord(session, bucket, collection)
        ? [...defaultButtons, ...hooks]
        : hooks}
    </div>
  );
}

export default class CollectionRecords extends PureComponent {
  // This is useful to identify wrapped component for plugin hooks when code is
  // minified; see https://github.com/facebook/react/issues/4915
  static displayName = "CollectionRecords";

  props: {
    capabilities: Capabilities,
    pluginHooks: Object,
    params: CollectionRouteParams,
    session: SessionState,
    bucket: BucketState,
    collection: CollectionState,
    deleteRecord: (bid: string, cid: string, rid: string) => void,
    listRecords: (bid: string, cid: string, sort: ?string) => void,
    listNextRecords: () => void,
    redirectTo: (name: string, params: CollectionRouteParams) => void,
  };

  updateSort = (sort: string) => {
    const { params, listRecords } = this.props;
    const { bid, cid } = params;
    listRecords(bid, cid, sort);
  };

  render() {
    const {
      params,
      session,
      bucket,
      collection,
      deleteRecord,
      listNextRecords,
      redirectTo,
      pluginHooks,
      capabilities,
    } = this.props;
    const { bid, cid } = params;
    const {
      busy,
      data,
      currentSort,
      records,
      recordsLoaded,
      hasNextRecords,
    } = collection;
    const { schema, displayFields } = data;

    const listActions = (
      <ListActions
        bid={bid}
        cid={cid}
        bucket={bucket}
        session={session}
        collection={collection}
        hooks={pluginHooks.ListActions}
      />
    );

    return (
      <div className="list-page">
        <h1>Records of <b>{bid}/{cid}</b></h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          selected="records"
          capabilities={capabilities}>
          {listActions}
          <Table
            busy={busy}
            bid={bid}
            cid={cid}
            records={records}
            recordsLoaded={recordsLoaded}
            hasNextRecords={hasNextRecords}
            listNextRecords={listNextRecords}
            currentSort={currentSort}
            schema={schema}
            displayFields={displayFields || ["__json"]}
            deleteRecord={deleteRecord}
            updateSort={this.updateSort}
            redirectTo={redirectTo}
            capabilities={capabilities}
          />
          {listActions}
        </CollectionTabs>
      </div>
    );
  }
}
