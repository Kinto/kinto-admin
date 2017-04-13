/* @flow */

import type { RecordData, ResourceHistoryEntry, RouteLocation } from "../types";

import React, { PureComponent } from "react";
import { diffJson } from "diff";

import { timeago, humanDate } from "../utils";
import AdminLink from "./AdminLink";
import Spinner from "./Spinner";
import PaginatedTable from "./PaginatedTable";
import { getClient } from "../client";
import { omit, sortHistoryEntryPermissions } from "../utils";

function Diff({ source, target }) {
  const diff = diffJson(target, source);
  return (
    <pre className="json-record">
      {diff.map((chunk, i) => {
        const className = chunk.added
          ? "added"
          : chunk.removed ? "removed" : "";
        const prefixedChunk = chunk.value
          .split("\n")
          .filter(part => part !== "")
          .map(part => {
            const prefix = chunk.added ? "+ " : chunk.removed ? "- " : "  ";
            return prefix + part;
          })
          .join("\n");
        return (
          <div key={i} className={className}>
            <code>{prefixedChunk}</code>
          </div>
        );
      })}
    </pre>
  );
}

function fetchPreviousVersion(
  bid,
  entry: ResourceHistoryEntry
): Promise<?ResourceHistoryEntry> {
  const { uri, last_modified } = entry;
  return getClient()
    .bucket(bid)
    .listHistory({
      filters: { uri, _before: last_modified },
      limit: 1,
    })
    .then(({ data }) => data[0]);
}

function fetchCollectionStateAt(
  bid: string,
  cid: string,
  timestamp: ?string
): Promise<Object[]> {
  const coll = getClient().bucket(bid).collection(cid);
  const query = timestamp ? { at: parseInt(timestamp, 10) } : {};
  return coll.listRecords(query).then(({ data: records }) => {
    // clean entries for easier review
    return records
      .map(record => omit(record, ["last_modified", "schema"]))
      .sort((a, b) => (a.id > b.id ? 1 : -1));
  });
}

class HistoryRow extends PureComponent {
  props: {
    bid: string,
    entry: ResourceHistoryEntry,
    pos: number,
    enableDiffOverview: boolean,
  };

  static defaultProps = {
    enableDiffOverview: false,
  };

  state: {
    open: boolean,
    busy: boolean,
    previous: ?ResourceHistoryEntry,
    error: ?Error,
  };

  constructor(props) {
    super(props);
    this.state = { open: false, busy: false, previous: null, error: null };
  }

  toggle = event => {
    const { bid, entry } = this.props;
    event.preventDefault();
    if (entry.action !== "update") {
      return this.setState({ open: !this.state.open });
    }
    if (this.state.open) {
      return this.setState({ open: false });
    }
    if (this.state.previous) {
      return this.setState({ open: true });
    }
    this.setState({ busy: true });
    // We don't leverage redux store and dedicated action as this behavior is
    // contextually specific to this local component.
    fetchPreviousVersion(bid, entry)
      .then(previous => {
        if (previous == null) {
          this.setState({
            open: false,
            busy: false,
            previous: null,
            error: new Error("Couldn't fetch previous history entry."),
          });
        } else {
          this.setState({
            open: true,
            busy: false,
            previous: sortHistoryEntryPermissions(previous),
            error: null,
          });
        }
      })
      .catch(error => {
        this.setState({ open: true, busy: false, previous: null, error });
      });
  };

  render() {
    const { open, busy, previous, error } = this.state;
    const { entry, bid, enableDiffOverview, pos } = this.props;
    const {
      last_modified,
      action,
      resource_name,
      target,
      user_id,
      collection_id: cid,
      group_id: gid,
      record_id: rid,
    } = sortHistoryEntryPermissions(entry);

    const { data: { id: objectId } } = target;

    return (
      <tbody>
        <tr>
          <td>
            <span title={humanDate(last_modified)}>
              {timeago(last_modified)}
            </span>
          </td>
          <td>{action}</td>
          <td>{resource_name}</td>
          <td>
            <AdminLink
              name={`${resource_name}:attributes`}
              params={{ bid, cid, gid, rid }}>
              {objectId}
            </AdminLink>
          </td>
          <td>{user_id}</td>
          <td className="text-center">
            {resource_name === "record" &&
              enableDiffOverview &&
              pos !== 0 &&
              <span>
                <AdminLink
                  className="btn btn-xs btn-default"
                  title="Start history log from this point"
                  name="collection:history"
                  params={{ bid, cid }}
                  query={{ since: last_modified, resource_name: "record" }}>
                  <i className="glyphicon glyphicon-step-backward" />
                </AdminLink>
                {" "}
              </span>}
            <a
              href="."
              className="btn btn-xs btn-default"
              onClick={this.toggle}
              title="View entry details">
              <i
                className={`glyphicon glyphicon-eye-${open ? "close" : "open"}`}
              />
            </a>
          </td>
        </tr>
        <tr
          className="history-row-details"
          style={{ display: busy || open ? "table-row" : "none" }}>
          <td colSpan="6">
            {busy
              ? <Spinner />
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
  const {
    location,
    enableDiffOverview,
    onViewJournalClick,
    onDiffOverviewClick,
  }: {
    location: RouteLocation,
    enableDiffOverview: boolean,
    onViewJournalClick: () => void,
    onDiffOverviewClick: (timestamp: string) => void,
  } = props;
  const { pathname, query: { since } } = location;
  return (
    <p>
      Since {since ? humanDate(since) : ""}.
      {" "}
      <a
        href="#"
        onClick={event => {
          event.preventDefault();
          document.location.hash = pathname;
          onViewJournalClick();
        }}>
        View all entries
      </a>
      {enableDiffOverview &&
        since != null &&
        <span>
          {" | "}
          <a
            href="#"
            onClick={event => {
              event.preventDefault();
              onDiffOverviewClick(since);
            }}>
            View records list diff overview
          </a>
        </span>}
    </p>
  );
}

function DiffOverview(props) {
  const { source, target, since } = props;
  return (
    <div>
      <div className="alert alert-info">
        <p>
          This diff overview is computed against the current list of records in
          this collection and the list it contained on
          {" "}
          <b>{humanDate(since)}</b>
          .
        </p>
        <p>
          <b>Note:</b> <code>last_modified</code> and <code>schema</code>{" "}
          record metadata are omitted for easier review.
        </p>
      </div>
      <Diff source={source} target={target} />
    </div>
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
  enableDiffOverview: boolean,
  notifyError: (message: string, error: Error) => void,
};

export default class HistoryTable extends PureComponent {
  props: Props;

  static defaultProps = {
    enableDiffOverview: false,
  };

  state: {
    diffOverview: boolean,
    busy: boolean,
    current: ?(RecordData[]),
    previous: ?(RecordData[]),
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      diffOverview: false,
      busy: false,
      current: null,
      previous: null,
    };
  }

  onDiffOverviewClick = (since: string): void => {
    const { enableDiffOverview, bid, cid, notifyError } = this.props;
    if (!enableDiffOverview || cid == null) {
      return;
    }
    this.setState({ busy: true });
    fetchCollectionStateAt(bid, cid)
      .then(current => {
        this.setState({ current });
        return fetchCollectionStateAt(bid, cid, since);
      })
      .then(previous => {
        this.setState({ previous, busy: false, diffOverview: true });
      })
      .catch(err => {
        notifyError("Couldn't compute records list diff overview", err);
        this.setState({
          diffOverview: false,
          busy: false,
          previous: null,
          current: null,
        });
      });
  };

  onViewJournalClick = (): void => {
    this.setState({ diffOverview: false, current: null, previous: null });
  };

  render() {
    const {
      enableDiffOverview,
      history,
      historyLoaded,
      hasNextHistory,
      listNextHistory,
      bid,
      cid,
      location,
    } = this.props;
    const { current, previous, diffOverview } = this.state;
    const { since } = location.query;
    const isFiltered = !!since;

    const thead = (
      <thead>
        <tr>
          <th>When</th>
          <th>Action</th>
          <th>Resource</th>
          <th>Id</th>
          <th>Author</th>
          <th />
        </tr>
      </thead>
    );

    const tbody = history.map((entry, index) => {
      return (
        <HistoryRow
          key={index}
          pos={index}
          enableDiffOverview={enableDiffOverview}
          bid={bid}
          entry={entry}
        />
      );
    });

    return (
      <div>
        {isFiltered &&
          <FilterInfo
            location={location}
            enableDiffOverview={enableDiffOverview}
            onDiffOverviewClick={this.onDiffOverviewClick}
            onViewJournalClick={this.onViewJournalClick}
          />}
        {cid && diffOverview && since
          ? <DiffOverview since={since} source={current} target={previous} />
          : !historyLoaded
              ? <Spinner />
              : <PaginatedTable
                  colSpan={6}
                  thead={thead}
                  tbody={tbody}
                  dataLoaded={historyLoaded}
                  hasNextPage={hasNextHistory}
                  listNextPage={listNextHistory}
                />}
      </div>
    );
  }
}
