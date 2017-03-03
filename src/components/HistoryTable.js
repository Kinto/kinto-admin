/* @flow */

import type { RecordData, ResourceHistoryEntry, RouteLocation } from "../types";

import React, { Component } from "react";
import { diffJson } from "diff";

import { timeago, humanDate } from "../utils";
import AdminLink from "./AdminLink";
import Spinner from "./Spinner";
import PaginatedTable from "./PaginatedTable";
import { getClient } from "../client";
import { omit } from "../utils";


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

function fetchCollectionStateAt(bid: string, cid: string, timestamp: ?string): Promise<Object[]> {
  const coll = getClient().bucket(bid).collection(cid);
  const query = timestamp ? {at: parseInt(timestamp, 10)} : {};
  return coll.listRecords(query)
    .then(({data: records}) => {
      // clean entries for easier review
      return records
        .map((record) => omit(record, ["last_modified", "schema"]))
        .sort((a, b) => a.id > b.id ? 1 : -1);
    });
}

class HistoryRow extends Component {
  props: {
    bid: string,
    entry: ResourceHistoryEntry,
    pos: number,
    fullDiffSupport: boolean,
  };

  static defaultProps = {
    fullDiffSupport: false,
  };

  state: {
    open: boolean,
    busy: boolean,
    previous: ?ResourceHistoryEntry,
    error: ?Error,
  };

  constructor(props) {
    super(props);
    this.state = {open: false, busy: false, previous: null, error: null};
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
    this.setState({busy: true});
    // We don't leverage redux store and dedicated action as this behavior is
    // contextually specific to this local component.
    fetchPreviousVersion(bid, entry)
      .then((previous) => this.setState({open: true, busy: false, previous, error: null}))
      .catch((error) => this.setState({open: true, busy: false, previous: null, error}));
  };

  render() {
    const {open, busy, previous, error} = this.state;
    const {entry, bid, fullDiffSupport, pos} = this.props;
    const {
      last_modified,
      action,
      resource_name,
      target,
      user_id,
      collection_id: cid,
      group_id: gid,
      record_id: rid,
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
            {fullDiffSupport && pos !== 0 && (
              <span>
                <AdminLink
                  className="btn btn-xs btn-default"
                  title="Start history log from this point"
                  name="collection:history"
                  params={{bid, cid}}
                  query={{since: last_modified, resource_name: "record"}}>
                  <i className="glyphicon glyphicon-step-backward" />
                </AdminLink>
                {" "}
              </span>
            )}
            <a href="." className="btn btn-xs btn-default"
               onClick={this.toggle}
               title="View entry details">
              <i className={`glyphicon glyphicon-eye-${open ? "close" : "open"}`} />
            </a>
          </td>
        </tr>
        <tr className="history-row-details"
            style={{display: busy || open ? "table-row" : "none"}}>
          <td colSpan="6">
            {busy
              ? <Spinner/>
              : previous
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
  const {location, fullDiffSupport, onViewJournalClick, onViewDiffClick}: {
    location: RouteLocation,
    fullDiffSupport: boolean,
    onViewJournalClick: () => void,
    onViewDiffClick: (timestamp: string) => void
  } = props;
  const {pathname, query: {since}} = location;
  return (
    <p>
      Since {since ? humanDate(since) : ""}.
      {" "}
      <a href="#" onClick={(event) => {
        event.preventDefault();
        document.location.hash = pathname;
        onViewJournalClick();
      }}>View all entries</a>
      {fullDiffSupport && since != null && (
        <span>
          {" | "}
          <a href="#" onClick={(event) => {
            event.preventDefault();
            onViewDiffClick(since);
          }}>View full diff</a>
        </span>
      )}
    </p>
  );
}

type Props = {
  bid: string,
  cid?: string,
  location: RouteLocation,
  history: ResourceHistoryEntry[],
  historyLoaded: boolean,
  hasNextHistory: boolean,
  listNextHistory: ?Function,
  fullDiffSupport: boolean,
  notifyError: (message: string, error: Error) => void,
};

export default class HistoryTable extends Component {
  props: Props;

  static defaultProps = {
    fullDiffSupport: false,
  };

  state: {
    fullDiff: boolean,
    busy: boolean,
    current: ?RecordData[],
    previous: ?RecordData[],
  };

  constructor(props: Props) {
    super(props);
    this.state = {fullDiff: false, busy: false, current: null, previous: null};
  }

  onViewDiffClick = (since: string): void => {
    const {bid, cid, notifyError} = this.props;
    if (cid == null) {
      return;
    }
    this.setState({busy: true});
    fetchCollectionStateAt(bid, cid)
      .then((current) => {
        this.setState({current});
        return fetchCollectionStateAt(bid, cid, since);
      })
      .then((previous) => {
        this.setState({previous, busy: false, fullDiff: true});
      })
      .catch((err) => {
        notifyError("Couldn't compute full diff", err);
        this.setState({fullDiff: false, busy: false, previous: null, current: null});
      });
  };

  onViewJournalClick = (): void => {
    this.setState({fullDiff: false, current: null, previous: null});
  }

  render() {
    const {
      fullDiffSupport,
      history,
      historyLoaded,
      hasNextHistory,
      listNextHistory,
      bid,
      cid,
      location,
    } = this.props;
    const {current, previous, fullDiff} = this.state;
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
      return (
        <HistoryRow
          key={index}
          pos={index}
          fullDiffSupport={fullDiffSupport}
          bid={bid}
          entry={entry} />
      );
    });

    return (
      <div>
        {isFiltered ?
          <FilterInfo
            location={location}
            fullDiffSupport={fullDiffSupport}
            onViewDiffClick={this.onViewDiffClick}
            onViewJournalClick={this.onViewJournalClick} /> : null}
        {cid && fullDiff
          ? <Diff source={current} target={previous}/>
          : !historyLoaded
            ? <Spinner/>
            : <PaginatedTable
                colSpan={6}
                thead={thead}
                tbody={tbody}
                dataLoaded={historyLoaded}
                hasNextPage={hasNextHistory}
                listNextPage={listNextHistory} />}
      </div>
    );
  }
}
