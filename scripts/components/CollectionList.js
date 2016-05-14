import React, { Component } from "react";
import { Link } from "react-router";
import Kinto from "kinto";

import BusyIndicator from "./BusyIndicator";


const {MANUAL, CLIENT_WINS, SERVER_WINS} = Kinto.syncStrategy;


class Row extends Component {
  static get defaultProps() {
    return {
      schema: {},
      displayFields: [],
      record: {},
    };
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
    const {name, record} = this.props;
    this.props.updatePath(`/collections/${name}/edit/${record.id}`);
  }

  onDeleteClick(event) {
    if (confirm("Are you sure?")) {
      this.props.deleteRecord(this.props.record.id);
    }
  }

  recordField(displayField) {
    if (this.props.record.hasOwnProperty(displayField)) {
      const field = this.props.record[displayField];
      if (typeof field === "string") {
        return field;
      } else if (typeof field === "object") {
        return JSON.stringify(field);
      } else {
        return String(field);
      }
    }
    return "<unknown>";
  }

  render() {
    const { name, record, displayFields} = this.props;
    return <tr onDoubleClick={this.onDoubleClick.bind(this)}>
      {
        displayFields.map((displayField, index) => {
          return <td key={index}>{this.recordField(displayField)}</td>;
        })
      }
      <td className="lastmod">{this.lastModified}</td>
      <td className="status">{record._status}</td>
      <td className="actions text-right">
        <div className="btn-group">
          <Link to={`/collections/${name}/edit/${record.id}`}
            className="btn btn-sm btn-info">Edit</Link>
          <button type="button" className="btn btn-sm btn-danger"
            onClick={this.onDeleteClick.bind(this)}>Delete</button>
        </div>
      </td>
    </tr>;
  }
}

class Table extends Component {
  render() {
    const {
      name,
      records,
      schema,
      displayFields,
      conflicts,
      deleteRecord,
      updatePath
    } = this.props;
    if (records.length === 0) {
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
              displayFields.map((field, index) => {
                return (
                  <th key={index}>{
                    schema.properties[field].title
                  }</th>
                );
              })
            }
            <th>Last mod.</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{
          records.map((record, index) => {
            return (
              <Row key={index}
                name={name}
                record={record}
                conflict={conflicts[record.id]}
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
  const {cid} = props;
  return (
    <div className="list-actions">
      <Link to={`/collections/${cid}/add`} className="btn btn-info">
        Add
      </Link>
      <Link className="btn btn-info" to={`/collections/${cid}/bulk`}>
        Bulk add
      </Link>
    </div>
  );
}

export default class CollectionList extends Component {
  render() {
    const {session, collection} = this.props;
    const {name, busy, schema, displayFields, records} = collection;
    const {deleteRecord, conflicts} = this.props;
    if (!name) {
      return <p>Loading...</p>;
    }
    const listActions = (
      <ListActions cid={name} />
    );
    return (
      <div className="collection-page">
        <div className="row content-header">
          <h1 className="col-md-8">{name}</h1>
          <div className="server-info col-md-4 text-right">
            <em>{busy ? <BusyIndicator/> : null}{session.server}</em>
          </div>
        </div>
        {listActions}
        <Table
          name={name}
          records={records}
          conflicts={conflicts}
          schema={schema}
          displayFields={displayFields}
          deleteRecord={deleteRecord}
          updatePath={this.props.updatePath} />
        {listActions}
      </div>
    );
  }
}
