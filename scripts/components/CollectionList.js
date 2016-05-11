import React, { Component } from "react";
import { Link } from "react-router";
import Kinto from "kinto";

import BusyIndicator from "./BusyIndicator";


const {MANUAL, CLIENT_WINS, SERVER_WINS} = Kinto.syncStrategy;

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
    const {collection} = this.props;
    if (this.state.enabled) {
      return (
        <span className="btn-group" role="group">
          <Link className="btn btn-info" to={`/collections/${collection}/bulk`}>
            Bulk add
          </Link>
          <button type="button" className="btn btn-warning"
            onClick={this.props.resetSync}>Reset Sync Status</button>
        </span>
      );
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
    const { name, record, config, conflict } = this.props;
    const classes = [
      record._status !== "synced" ? "unsynced" : "",
      conflict ? "conflicting" : ""
    ].join(" ").trim();

    return <tr className={classes}
      onDoubleClick={this.onDoubleClick.bind(this)}>
      {
        config.displayFields.map((displayField, index) => {
          return <td key={index}>{this.recordField(displayField)}</td>;
        })
      }
      <td className="lastmod">{this.lastModified}</td>
      <td className="status">{record._status}</td>
      <td className="actions text-right">
        <div className="btn-group">
          <Link to={`/collections/${name}/edit/${record.id}`}
            className="btn btn-sm btn-info">Edit</Link>
          {
            conflict ?
              <Link to={`/collections/${name}/resolve/${conflict.local.id}`}
                className="btn btn-sm btn-warning">Resolve</Link> :
              <button type="button" className="btn btn-sm btn-warning"
                disabled>Resolve</button>
          }
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
      config,
      conflicts,
      deleteRecord,
      updatePath
    } = this.props;
    if (records.length === 0) {
      return <p>This collection is empty.</p>;
    }
    return (
      <table className="table table-striped record-list">
        <thead>
          <tr>
            {
              config.displayFields.map((field, index) => {
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
                config={config}
                deleteRecord={deleteRecord}
                updatePath={updatePath} />
            );
          })
        }</tbody>
      </table>
    );
  }
}

class SyncButton extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false, strategy: MANUAL};
  }

  openMenu = () => this.setState({open: true});
  closeMenu = () => this.setState({open: false});

  doSync = () => {
    this.props.sync({strategy: this.state.strategy});
    this.setState({open: false});
  };

  selectStrategy = (strategy) => {
    return (event) => {
      event.preventDefault();
      this.setState({strategy, open: false});
    };
  }

  render() {
    const {open, strategy} = this.state;
    return (
      <div className={`btn-group ${open ? "open" : ""}`}>
        <button type="button" className="btn btn-info btn-sync"
          onClick={this.doSync}>Synchronize ({strategy.toUpperCase()})</button>
        <button type="button" className="btn btn-info dropdown-toggle"
          title="Select alternative strategy"
          onClick={open ? this.closeMenu : this.openMenu}>
          <span className="caret"></span>
        </button>
        <ul className="dropdown-menu">
          <li onClick={this.selectStrategy(MANUAL)}>
            <a href="#">MANUAL resolution</a>
          </li>
          <li onClick={this.selectStrategy(CLIENT_WINS)}>
            <a href="#">CLIENT_WINS</a>
          </li>
          <li onClick={this.selectStrategy(SERVER_WINS)}>
            <a href="#">SERVER_WINS</a>
          </li>
        </ul>
      </div>
    );
  }
}

function ListActions(props) {
  const {name, sync, reset} = props;
  return (
    <div className="list-actions">
      <SyncButton sync={sync} />
      <Link to={`/collections/${name}/add`} className="btn btn-info">Add</Link>
      <AdvancedActions collection={name} resetSync={reset} />
    </div>
  );
}

export default class CollectionList extends Component {
  onResetSyncClick() {
    if (confirm("Are you sure?")) {
      this.props.resetSync();
    }
  }

  render() {
    const {name, busy, schema, records, config} = this.props.collection;
    const {server} = this.props.settings;
    const {deleteRecord, conflicts, sync} = this.props;
    if (!name) {
      return <p>Loading...</p>;
    }
    const listActions = (
      <ListActions
        name={name}
        sync={sync}
        reset={this.onResetSyncClick.bind(this)} />
    );
    return (
      <div className="collection-page">
        <div className="row content-header">
          <h1 className="col-md-8">{name}</h1>
          <div className="server-info col-md-4 text-right">
            <em>{busy ? <BusyIndicator/> : null}{server}</em>
          </div>
        </div>
        {listActions}
        <Table
          name={name}
          records={records}
          conflicts={conflicts}
          schema={schema}
          config={config}
          deleteRecord={deleteRecord}
          updatePath={this.props.updatePath} />
        {listActions}
      </div>
    );
  }
}
