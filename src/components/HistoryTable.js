/* @flow */

import type { ResourceHistoryEntry, RouteLocation } from "../types";

import React, { Component } from "react";
import { Link } from "react-router";
import { diffJson } from "diff";

import { timeago, humanDate } from "../utils";
import AdminLink from "./AdminLink";
import PaginatedTable from "./PaginatedTable";
import { getClient } from "../client";


function Diff({source, target}) {
  const diff = diffJson(target, source);
  return (
    <pre className="json-record">{
      diff.map((chunk, i) => {
        const className = chunk.added ? "added" : chunk.removed ? "removed" : "";
        const prefixedChunk = chunk.value.split("\n")
          .filter(part => part !== "")
          .map((part) => {
            const prefix = chunk.added ? "+ " : chunk.removed ? "- " : "  ";
            return prefix + part;
          })
          .join("\n");
        return (
          <div key={i} className={className}>
            <code>{prefixedChunk}</code>
          </div>
        );
      })
    }</pre>
  );
}

function fetchPreviousVersion(bid, entry: ResourceHistoryEntry): Promise<?ResourceHistoryEntry> {
  const {uri, last_modified} = entry;
  return getClient().bucket(bid).listHistory({
    filters: {uri, _before: last_modified},
    limit: 1
  }).then(({data}) => data[0]);
}

class HistoryRow extends Component {
  props: {
    bid: string,
    entry: ResourceHistoryEntry,
  };

  state: {
    open: boolean,
    previous: ?ResourceHistoryEntry,
    error: ?Error,
  };

  constructor(props) {
    super(props);
    this.state = {open: false, previous: null, error: null};
  }

  toggle = (event) => {
    const {bid, entry} = this.props;
    event.preventDefault();
    if (entry.action !== "update") {
      return this.setState({open: !this.state.open});
    }
    if (this.state.open) {
      return this.setState({open: false});
    }
    if (this.state.previous) {
      return this.setState({open: true});
    }
    // We don't leverage redux store and dedicated action as this behavior is
    // contextually specific to this local component.
    fetchPreviousVersion(bid, entry)
      .then((previous) => this.setState({open: true, previous, error: null}))
      .catch((error) => this.setState({open: true, previous: null, error}));
  };

  render() {
    const {open, previous, error} = this.state;
    const {entry, bid} = this.props;
    const {
      last_modified,
      action,
      resource_name,
      target,
      user_id,
      collection_id: cid,
      group_id: gid,
      record_id: rid
    } = entry;

    const {data: {id: objectId}} = target;

    return (
      <tbody>
        <tr>
          <td>
            <span title={humanDate(last_modified)}>{timeago(last_modified)}</span>
          </td>
          <td>{action}</td>
          <td>{resource_name}</td>
          <td>
            <AdminLink
              name={`${resource_name}:attributes`}
              params={{bid, cid, gid, rid}}>{objectId}</AdminLink>
          </td>
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
            {previous
              ? <Diff source={entry.target} target={previous.target} />
              : error
                ? <p className="alert alert-danger">{error}</p>
                : <pre>{JSON.stringify(entry.target, null, 2)}</pre>}
          </td>
        </tr>
      </tbody>
    );
  }
}

function FilterInfo(props) {
  const {location}: {location: RouteLocation} = props;
  const {pathname, query: {since}} = location;
  return (
    <p>
      Since {since ? humanDate(since) : ""}.
      {" "}
      <Link to={pathname}>View all entries</Link>
    </p>
  );
}

export default class HistoryTable extends Component {
  props: {
    bid: string,
    location: RouteLocation,
    history: ResourceHistoryEntry[],
    historyLoaded: boolean,
    hasNextHistory: boolean,
    listNextHistory: ?Function,
  };

  render() {
    const {
      history,
      historyLoaded,
      hasNextHistory,
      listNextHistory,
      bid,
      location,
    } = this.props;
    const isFiltered = !!location.query.since;

    const thead = (
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
    );

    const tbody = history.map((entry, index) => {
      return <HistoryRow key={index} bid={bid} entry={entry} />;
    });

    return (
      <div>
        {isFiltered ? <FilterInfo location={location} /> : null}
        <PaginatedTable
          colSpan={6}
          thead={thead}
          tbody={tbody}
          dataLoaded={historyLoaded}
          hasNextPage={hasNextHistory}
          listNextPage={listNextHistory} />
      </div>
    );
  }
}
