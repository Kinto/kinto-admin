import React, { Component } from "react";
import { Link } from "react-router";
import { timeago, humanDate } from "../utils";


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
    const {entry, bid} = this.props;
    const {
      date,
      action,
      resource_name,
      target,
      user_id,
      collection_id: cid,
      group_id: gid,
      record_id: rid
    } = entry;

    const {data: {id: objectId}} = target;

    const link = {
      bucket: `/buckets/${bid}/attributes`,
      collection: `/buckets/${bid}/collections/${cid}/attributes`,
      group: `/buckets/${bid}/groups/${gid}/attributes`,
      record: `/buckets/${bid}/collections/${cid}/records/${rid}/attributes`
    }[resource_name];

    return (
      <tbody>
        <tr>
          <td>
            <span title={date}>{timeago(date + "Z")}</span>
          </td>
          <td>{action}</td>
          <td>{resource_name}</td>
          <td>{link ? <Link to={link}>{objectId}</Link> : objectId}</td>
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


function FilterInfo({location}) {
  const {pathname, query: {since}} = location;
  return (
    <p>
      Since {humanDate(since)}.
      {" "}
      <Link to={pathname}>View all entries</Link>
    </p>
  );
}

export default class HistoryTable extends Component {
  render() {
    const {history, bid, location} = this.props;
    const isFiltered = !!location.query.since;
    return (
      <div>
        {isFiltered ? <FilterInfo location={location} /> : null}
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
              return <HistoryRow key={index} bid={bid} entry={entry} />;
            })
          }
        </table>
      </div>
    );
  }
}
