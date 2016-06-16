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

class Table extends Component {
  static defaultProps = {
    displayFields: ["__json"]
  }

  getFieldTitle(displayField) {
    const {schema} = this.props;
    if (displayField === "__json") {
      return "JSON";
    }
    if (schema &&
        schema.properties &&
        displayField in schema.properties &&
        "title" in schema.properties[displayField]) {
      return schema.properties[displayField].title;
    }
    return displayField;
  }

  render() {
    const {
      busy,
      bid,
      cid,
      records,
      recordsLoaded,
      schema,
      displayFields,
      deleteRecord,
      updatePath
    } = this.props;

    if (busy || !recordsLoaded) {
      return <Spinner />;
    } else if (records.length === 0) {
      return (
        <div className="alert alert-info">
          <p>This collection is empty.</p>
        </div>
      );
    }

    return (
      <table className="table table-striped record-list">
        <thead>
          <tr>
            {
              displayFields.map((displayField, index) => {
                return (
                  <th key={index}>{this.getFieldTitle(displayField)}</th>
                );
              })
            }
            <th>Last mod.</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{
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
  const {bid, cid, session, collection} = props;
  if (session.busy || collection.busy) {
    return null;
  }
  return (
    <div className="row list-actions">
      <div className="col-xs-8">
        {canCreateRecord(session, collection) ?
          <div>
            <Link to={`/buckets/${bid}/collections/${cid}/add`}
              className="btn btn-info btn-record-add">Add</Link>
            <Link to={`/buckets/${bid}/collections/${cid}/bulk`}
              className="btn btn-info btn-record-bulk-add">Bulk add</Link>
          </div> : null}
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
  render() {
    const {params, session, collection, deleteRecord, updatePath} = this.props;
    const {bid, cid} = params;
    const {
      busy,
      name,
      schema,
      displayFields,
      records,
      recordsLoaded,
    } = collection;

    const listActions = (
      <ListActions
        bid={bid}
        cid={cid}
        session={session}
        collection={collection} />
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
          schema={schema}
          displayFields={displayFields}
          deleteRecord={deleteRecord}
          updatePath={updatePath} />
        {listActions}
      </div>
    );
  }
}
