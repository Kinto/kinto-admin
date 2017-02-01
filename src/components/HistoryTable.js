/* @flow */

import type { ResourceHistoryEntry, RouteLocation } from "../types";

import React, { Component } from "react";
import { Link } from "react-router";
import { diffJson } from "diff";

import { timeago, humanDate } from "../utils";
import AdminLink from "./AdminLink";
import PaginatedTable from "./PaginatedTable";


function Diff({source, target}) {
  const diff = diffJson(target, source);
  return (
    <pre className="json-record">{
      diff.map((chunk, i) => {
        const color = chunk.added ? "green" : chunk.removed ? "red" : "inherit";
        const prefixedChunk = chunk.value.split("\n")
          .filter(part => part !== "")
          .map((part) => {
            const prefix = chunk.added ? "+ " : chunk.removed ? "- " : "  ";
            return prefix + part;
          })
          .join("\n");
        return (
          <div key={i}>
            <code style={{color}}>{prefixedChunk}</code>
          </div>
        );
      })
    }</pre>
  );
}

class HistoryRow extends Component {
  props: {
    bid: string,
    current: ResourceHistoryEntry,
    previous: ?ResourceHistoryEntry,
  };

  state: {
    open: boolean
  };

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
    const {current, previous, bid} = this.props;
    const {
      last_modified,
      action,
      resource_name,
      target,
      user_id,
      collection_id: cid,
      group_id: gid,
      record_id: rid
    } = current;

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
            {previous && (
              <a href="." className="btn btn-xs btn-default"
                 onClick={this.toggle}
                 title="View entry details">
                <i className={`glyphicon glyphicon-eye-${open ? "close" : "open"}`} />
              </a>
            )}
          </td>
        </tr>
        <tr className="history-row-details"
            style={{display: open ? "table-row" : "none"}}>
          <td colSpan="6">
            {previous && <Diff source={current.target} target={previous.target} />}
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

    const tbody = history
      .reduce((acc, entry) => {
        const previous = acc[acc.length - 1];
        return [
          ...acc,
          {
            current: entry,
            previous: previous ? previous.current : null,
          }
        ];
      }, [])
      .map(({current, previous}, index) => {
        return (
          <HistoryRow
            key={index}
            bid={bid}
            current={current}
            previous={previous} />
        );
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
