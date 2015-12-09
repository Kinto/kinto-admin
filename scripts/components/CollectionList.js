import React, { Component } from "react";
import LinkButton from "./LinkButton";
import BusyIndicator from "./BusyIndicator";

class AdvancedActions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {enabled: false};
  }

  onAdvancedLinkClick(event) {
    event.preventDefault();
    this.setState({enabled: true});
  }

  render() {
    if (this.state.enabled) {
      return <button type="button"
        onClick={this.props.resetSync}>Reset Sync Status</button>;
    }
    return <a href="" onClick={this.onAdvancedLinkClick.bind(this)}>
      &raquo; Show advanced actions
    </a>;
  }
}

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
      return String(this.props.record[displayField]);
    }
    return "<unknown>";
  }

  render() {
    const { name, record, config } = this.props;
    return <tr className={record._status !== "synced" ? "unsynced" : ""}
      onDoubleClick={this.onDoubleClick.bind(this)}>
      {
        config.displayFields.map((displayField, index) => {
          return <td key={index}>{this.recordField(displayField)}</td>;
        })
      }
      <td className="lastmod">{this.lastModified}</td>
      <td className="status">{record._status}</td>
      <td className="actions">
        <LinkButton label="Edit"
          to={`/collections/${name}/edit/${record.id}`} />
        <button type="button"
          onClick={this.onDeleteClick.bind(this)}>Delete</button>
      </td>
    </tr>;
  }
}

class Table extends Component {
  render() {
    const {name, records, schema, config, deleteRecord, updatePath} = this.props;
    if (records.length === 0) {
      return <p>This collection is empty.</p>;
    }
    return (
      <table className="record-list">
        <thead>
          <tr>
            {
              config.displayFields.map((field, index) => {
                return <th key={index}>{
                  schema.properties[field].title
                }</th>;
              })
            }
            <th>Last mod.</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{
          records.map((record, index) => {
            return <Row key={index}
              name={name}
              record={record}
              schema={schema}
              config={config}
              deleteRecord={deleteRecord}
              updatePath={updatePath} />;
          })
        }</tbody>
      </table>
    );
  }
}

export default class CollectionList extends Component {
  onSyncClick() {
    this.props.sync();
  }

  onResetSyncClick() {
    if (confirm("Are you sure?")) {
      this.props.resetSync();
    }
  }

  render() {
    const {name, busy, schema, records, config} = this.props.collection;
    const {server} = this.props.settings;
    const {deleteRecord} = this.props;
    if (!name) {
      return <p>Loading...</p>;
    }
    return (
      <div className="collection-page">
        <h1>
          {name}
          <em>{busy ? <BusyIndicator/> : null}{server}</em>
        </h1>
        <Table
          name={name}
          records={records}
          schema={schema}
          config={config}
          deleteRecord={deleteRecord}
          updatePath={this.props.updatePath} />
        <p className="actions">
          <button type="button"
            className="btn-sync"
            onClick={this.onSyncClick.bind(this)}>Synchronize</button>
          <LinkButton label="Add" to={`/collections/${name}/add`} />
          <AdvancedActions resetSync={this.onResetSyncClick.bind(this)} />
        </p>
      </div>
    );
  }
}
