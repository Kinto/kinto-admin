import React, { Component } from "react";
import { Link } from "react-router";

import Spinner from "./Spinner";


class HistoryRow extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  toggle = (event) => {
    event.preventDefault();
    this.setState({open: !this.state.open});
  };

  render() {
    const {open} = this.state;
    const {entry} = this.props;
    const {
      date,
      action,
      resource_name,
      collection_id,
      record_id,
      user_id,
    } = entry;
    return (
      <tbody>
        <tr>
          <td>{date}</td>
          <td>{action}</td>
          <td>{resource_name}</td>
          <td>{resource_name === "collection" ? collection_id : record_id}</td>
          <td>{user_id}</td>
          <td className="text-center">
            <a href="." className="btn btn-xs btn-default"
               onClick={this.toggle}>
              <i className={`glyphicon glyphicon-eye-${open ? "close" : "open"}`} />
            </a>
          </td>
        </tr>
        <tr className="history-row-details"
            style={{display: open ? "table-row" : "none"}}>
          <td colSpan="6">
            <pre>{JSON.stringify(entry, null, 2)}</pre>
          </td>
        </tr>
      </tbody>
    );
  }
}

function HistoryTable(props) {
  const {history} = props;
  return (
    <table className="table table-striped table-bordered history-list">
      <thead>
        <tr>
          <th>Date</th>
          <th>Action</th>
          <th>Resource</th>
          <th>Id</th>
          <th>Author</th>
          <th></th>
        </tr>
      </thead>
      {
        history.map((entry, index) => {
          return <HistoryRow key={index} entry={entry} />;
        })
      }
    </table>
  );
}

export default class CollectionHistory extends Component {
  render() {
    const {params, collection} = this.props;
    const {bid, cid} = params;
    const {history, historyLoaded} = collection;

    return (
      <div className="collection-history">
        <h1>History for <b>{bid}/{cid}</b></h1>
        { !historyLoaded ? <Spinner /> :
          <HistoryTable history={history} />}
      </div>
    );
  }
}
