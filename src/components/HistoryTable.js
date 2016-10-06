import React, { Component } from "react";
import { timeago } from '../utils';


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
      target,
      user_id,
    } = entry;
    return (
      <tbody>
        <tr>
          <td>
            <span title={date}>{timeago(date + "Z")}</span>
          </td>
          <td>{action}</td>
          <td>{resource_name}</td>
          <td>{target && target.data && target.data.id}</td>
          <td>{user_id}</td>
          <td className="text-center">
            <a href="." className="btn btn-xs btn-default"
               onClick={this.toggle}
               title="View entry details">
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

export default class HistoryTable extends Component {
  render() {
    const {history} = this.props;
    return (
      <table className="table table-striped table-bordered record-list">
        <thead>
          <tr>
            <th>When</th>
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
}
