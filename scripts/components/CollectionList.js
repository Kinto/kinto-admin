import React, { Component } from "react";
import { Link } from "react-router";

import { renderDisplayField } from "../utils";
import { canCreateRecord } from "../permission";
import Spinner from "./Spinner";


class Row extends Component {
  static defaultProps = {
    schema: {},
    displayFields: ["__json"],
    record: {},
  }

  get lastModified() {
    const lastModified = this.props.record.last_modified;
    if (!lastModified) {
      return null;
    }
    const date = new Date(lastModified).toISOString();
    return date.slice(0, 10) + " " + date.slice(11, 19);
  }

  onDoubleClick(event) {
    event.preventDefault();
    const {bid, cid, record, updatePath} = this.props;
    updatePath(`/buckets/${bid}/collections/${cid}/edit/${record.id}`);
  }

  onDeleteClick(event) {
    const {bid, cid, record, deleteRecord} = this.props;
    if (confirm("Are you sure?")) {
      deleteRecord(bid, cid, record.id);
    }
  }

  render() {
    const {bid, cid, record, displayFields} = this.props;
    return <tr onDoubleClick={this.onDoubleClick.bind(this)}>
      {
        displayFields.map((displayField, index) => {
          return <td key={index}>{renderDisplayField(record, displayField)}</td>;
        })
      }
      <td className="lastmod">{this.lastModified}</td>
      <td className="actions text-right">
        {record.attachment && record.attachment.location ?
          <i className="glyphicon glyphicon-paperclip" /> : null}
        <div className="btn-group">
          <Link to={`/buckets/${bid}/collections/${cid}/edit/${record.id}`}
            className="btn btn-xs btn-info">Edit</Link>
          <button type="button" className="btn btn-xs btn-danger"
            onClick={this.onDeleteClick.bind(this)}>Delete</button>
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
  const {column, sort, updateSort} = props;
  if (!sort || column === "__json") {
    return null;
  }
  let active, direction;
  // Check if we're currently sorting on this field.
  if (new RegExp(`^-?${column}$`).test(sort)) {
    // We're sorting on this field; check for direction.
    active = true;
    direction = sort.startsWith("-") ? "down" : "up";
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
      busy,
      bid,
      cid,
      records,
      recordsLoaded,
      sort,
      schema,
      displayFields,
      deleteRecord,
      updateSort,
      updatePath
    } = this.props;

    if (busy) {
      return <Spinner />;
    } else if (recordsLoaded && records.length === 0) {
      return (
        <div className="alert alert-info">
          <p>This collection is empty.</p>
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
                        sort={sort}
                        column={displayField}
                        updateSort={updateSort} /> : null}
                  </th>
                );
              })
            }
            <th>
              Last mod.
              <ColumnSortLink
                sort={sort}
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
      </table>
    );
  }
}

function ListActions(props) {
  const {bid, cid, session, collection, hooks=[]} = props;
  if (session.busy || collection.busy) {
    return null;
  }
  const defaultButtons = [
    <Link key="__1" to={`/buckets/${bid}/collections/${cid}/add`}
          className="btn btn-info btn-record-add">Add</Link>,
    <Link key="__2" to={`/buckets/${bid}/collections/${cid}/bulk`}
          className="btn btn-info btn-record-bulk-add">Bulk add</Link>,
  ];
  return (
    <div className="row list-actions">
      <div className="col-xs-8">
        {canCreateRecord(session, collection) ?
          [...defaultButtons, ...hooks] : null}
      </div>
      <div className="edit-coll-props col-xs-4 text-right">
        <Link to={`/buckets/${bid}/collections/${cid}/edit`}
          className="btn btn-default">
          <i className="glyphicon glyphicon-cog"/>
          Collection settings
        </Link>
      </div>
    </div>
  );
}

export default class CollectionList extends Component {
  updateSort = (sort) => {
    const {params, listRecords} = this.props;
    const {bid, cid} = params;
    listRecords(bid, cid, sort);
  }

  render() {
    const {
      params,
      session,
      collection,
      deleteRecord,
      updatePath,
      pluginHooks,
    } = this.props;
    const {bid, cid} = params;
    const {
      busy,
      name,
      schema,
      displayFields,
      records,
      recordsLoaded,
      sort,
    } = collection;

    const listActions = (
      <ListActions
        bid={bid}
        cid={cid}
        session={session}
        collection={collection}
        hooks={pluginHooks.ListActions} />
    );

    return (
      <div className="collection-page">
        <h1>List of records in <b>{bid}/{name}</b></h1>
        {listActions}
        <Table
          busy={busy}
          bid={bid}
          cid={cid}
          records={records}
          recordsLoaded={recordsLoaded}
          sort={sort}
          schema={schema}
          displayFields={displayFields}
          deleteRecord={deleteRecord}
          updateSort={this.updateSort}
          updatePath={updatePath} />
        {listActions}
      </div>
    );
  }
}
