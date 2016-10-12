import React, { Component } from "react";
import { Link } from "react-router";

import { renderDisplayField, timeago } from "../../utils";
import { canCreateRecord } from "../../permission";
import Spinner from "../Spinner";
import CollectionTabs from "./CollectionTabs";


class Row extends Component {
  static defaultProps = {
    schema: {},
    displayFields: ["__json"],
    record: {},
  };

  get lastModified() {
    const lastModified = this.props.record.last_modified;
    if (!lastModified) {
      return null;
    }
    const date = new Date(lastModified).toISOString();
    return (
      <span title={date}>{timeago(date)}</span>
    );
  }

  onDoubleClick(event) {
    event.preventDefault();
    const {bid, cid, record, updatePath} = this.props;
    const {id: rid} = record;
    updatePath(`/buckets/${bid}/collections/${cid}/records/${rid}/edit`);
  }

  onDeleteClick(event) {
    const {bid, cid, record, deleteRecord} = this.props;
    const {id, last_modified} = record;
    if (confirm("Are you sure?")) {
      deleteRecord(bid, cid, id, last_modified);
    }
  }

  render() {
    const {bid, cid, record, displayFields} = this.props;
    const {id: rid} = record;
    return <tr onDoubleClick={this.onDoubleClick.bind(this)}>
      {
        displayFields.map((displayField, index) => {
          return <td key={index}>{renderDisplayField(record, displayField)}</td>;
        })
      }
      <td className="lastmod">{this.lastModified}</td>
      <td className="actions text-right">
        <div className="btn-group">
          {record.attachment && record.attachment.location ?
            <a href={record.attachment.location} className="btn btn-sm btn-default"
              title="The record has an attachment"
              target="_blank">
              <i className="glyphicon glyphicon-paperclip" />
            </a> : null}
          <Link to={`/buckets/${bid}/collections/${cid}/records/${rid}/edit`}
            className="btn btn-sm btn-info" title="Edit record">
            <i className="glyphicon glyphicon-pencil"/>
          </Link>
          <Link to={`/buckets/${bid}/collections/${cid}/records/${rid}/permissions`}
            className="btn btn-sm btn-warning" title="Record permissions">
            <i className="glyphicon glyphicon-lock"/>
          </Link>
          <button type="button" className="btn btn-sm btn-danger"
            onClick={this.onDeleteClick.bind(this)} title="Delete record">
            <i className="glyphicon glyphicon-trash"/>
          </button>
        </div>
      </td>
    </tr>;
  }
}

function SortLink(props) {
  const {dir, active, column, updateSort} = props;
  return (
    <a href="#"
      className={`sort-link ${active ? "active label label-default" : ""}`}
      onClick={(event) => {
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
      <i className={`glyphicon glyphicon-menu-${dir}`}/>
    </a>
  );
}

function ColumnSortLink(props) {
  const {column, currentSort, updateSort} = props;
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
      updateSort={updateSort} />
  );
}

class Table extends Component {
  static defaultProps = {
    displayFields: ["__json"]
  }

  getFieldTitle(displayField) {
    const {schema} = this.props;
    if (displayField === "__json") {
      return "JSON";
    }
    if (this.isSchemaProperty(displayField) &&
        "title" in schema.properties[displayField]) {
      return schema.properties[displayField].title;
    }
    return displayField;
  }

  isSchemaProperty(displayField) {
    const {schema} = this.props;
    return schema &&
           schema.properties &&
           displayField in schema.properties;
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
      updatePath
    } = this.props;

    if (recordsLoaded && records.length === 0) {
      return (
        <div className="alert alert-info">
          <p>This collection has no records.</p>
        </div>
      );
    }

    return (
      <table className="table table-striped table-bordered record-list">
        <thead>
          <tr>
            {
              displayFields.map((displayField, index) => {
                return (
                  <th key={index}>
                    {this.getFieldTitle(displayField)}
                    {this.isSchemaProperty(displayField) ?
                      <ColumnSortLink
                        currentSort={currentSort}
                        column={displayField}
                        updateSort={updateSort} /> : null}
                  </th>
                );
              })
            }
            <th>
              Last mod.
              <ColumnSortLink
                currentSort={currentSort}
                column="last_modified"
                updateSort={updateSort} />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody className={!recordsLoaded ? "loading" : ""}>{
          records.map((record, index) => {
            return (
              <Row key={index}
                bid={bid}
                cid={cid}
                record={record}
                schema={schema}
                displayFields={displayFields}
                deleteRecord={deleteRecord}
                updatePath={updatePath} />
            );
          })
        }</tbody>
        { hasNextRecords ?
          <tfoot>
            <tr>
              <td colSpan={displayFields.length + 2} className="load-more text-center">
                {!recordsLoaded ?  <Spinner /> :
                  <a href="." key="__3" onClick={(event) => {
                    event.preventDefault();
                    listNextRecords();
                  }}>Load more</a>}
              </td>
            </tr>
          </tfoot> : null }
      </table>
    );
  }
}

function ListActions(props) {
  const {bid, cid, session, bucket, collection, hooks=[]} = props;
  if (session.busy || collection.busy) {
    return null;
  }
  const defaultButtons = [
    <Link key="__1" to={`/buckets/${bid}/collections/${cid}/records/add`}
          className="btn btn-info btn-record-add">Add</Link>,
    <Link key="__2" to={`/buckets/${bid}/collections/${cid}/records/bulk`}
          className="btn btn-info btn-record-bulk-add">Bulk add</Link>,
  ];
  return (
    <div className="list-actions">
      {canCreateRecord(session, bucket, collection) ?
        [...defaultButtons, ...hooks] : null}
    </div>
  );
}

export default class CollectionRecords extends Component {
  // This is useful to identify wrapped component for plugin hooks when code is
  // minified; see https://github.com/facebook/react/issues/4915
  static displayName = "CollectionRecords";

  updateSort = (sort) => {
    const {params, listRecords} = this.props;
    const {bid, cid} = params;
    listRecords(bid, cid, sort);
  }

  render() {
    const {
      params,
      session,
      bucket,
      collection,
      deleteRecord,
      listNextRecords,
      updatePath,
      pluginHooks,
      capabilities,
    } = this.props;
    const {bid, cid} = params;
    const {
      busy,
      data,
      currentSort,
      records,
      recordsLoaded,
      hasNextRecords,
    } = collection;
    const {schema, displayFields} = data;

    const listActions = (
      <ListActions
        bid={bid}
        cid={cid}
        bucket={bucket}
        session={session}
        collection={collection}
        hooks={pluginHooks.ListActions} />
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
            displayFields={displayFields}
            deleteRecord={deleteRecord}
            updateSort={this.updateSort}
            updatePath={updatePath} />
          {listActions}
        </CollectionTabs>
      </div>
    );
  }
}
