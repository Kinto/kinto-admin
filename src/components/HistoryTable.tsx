import type { RecordData, ResourceHistoryEntry, RouteLocation } from "../types";
import type { Location } from "history";

import React, { PureComponent } from "react";

import { Eye } from "react-bootstrap-icons";
import { EyeSlash } from "react-bootstrap-icons";
import { SkipStart } from "react-bootstrap-icons";

import * as NotificationActions from "../actions/notifications";
import { diffJson, timeago, humanDate, parseHistoryFilters } from "../utils";
import AdminLink from "./AdminLink";
import Spinner from "./Spinner";
import PaginatedTable from "./PaginatedTable";
import { getClient } from "../client";
import { omit, sortHistoryEntryPermissions } from "../utils";

function Diff({ source, target }: { source: any; target: any }) {
  const diff = diffJson(source, target);
  return (
    <pre className="json-record">
      {diff.map((chunk: string, i) => {
        const className = chunk.startsWith("+")
          ? "added"
          : chunk.startsWith("-")
          ? "removed"
          : "";
        return (
          <div key={i} className={className}>
            <code>{chunk}</code>
          </div>
        );
      })}
    </pre>
  );
}

function fetchPreviousVersion(
  bid: string,
  entry: ResourceHistoryEntry
): Promise<ResourceHistoryEntry | null | undefined> {
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
  timestamp?: string
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

type HistoryRowProps = {
  bid: string;
  entry: ResourceHistoryEntry;
  pos: number;
  enableDiffOverview: boolean;
};

type HistoryRowState = {
  open: boolean;
  busy: boolean;
  previous: ResourceHistoryEntry | null | undefined;
  error: Error | null | undefined;
};

class HistoryRow extends PureComponent<HistoryRowProps, HistoryRowState> {
  static defaultProps = {
    enableDiffOverview: false,
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

    const {
      data: { id: objectId },
    } = target;

    return (
      <React.Fragment>
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
              params={{ bid, cid, gid, rid }}
            >
              {objectId}
            </AdminLink>
          </td>
          <td>{user_id}</td>
          <td className="text-center">
            {resource_name === "record" && enableDiffOverview && pos !== 0 && (
              <span>
                <AdminLink
                  className="btn btn-sm btn-secondary"
                  title="Start history log from this point"
                  name="collection:history"
                  params={{ bid, cid }}
                  query={{ since: last_modified, resource_name: "record" }}
                >
                  <SkipStart className="icon" />
                </AdminLink>{" "}
              </span>
            )}
            <a
              href="."
              className="btn btn-sm btn-secondary"
              onClick={this.toggle}
              title="View entry details"
            >
              {open ? <EyeSlash className="icon" /> : <Eye className="icon" />}
            </a>
          </td>
        </tr>
        {open ? (
          <tr
            className="history-row-details"
            style={{ display: busy || open ? "table-row" : "none" }}
          >
            <td colSpan={6}>
              {busy ? (
                <Spinner />
              ) : previous ? (
                <Diff source={previous.target} target={entry.target} />
              ) : error ? (
                <p className="alert alert-danger">{error.toString()}</p>
              ) : (
                <pre>{JSON.stringify(entry.target, null, 2)}</pre>
              )}
            </td>
          </tr>
        ) : null}
      </React.Fragment>
    );
  }
}

type FilterInfoProps = {
  location: RouteLocation;
  enableDiffOverview: boolean;
  onViewJournalClick: () => void;
  onDiffOverviewClick: (timestamp: string) => void;
};

function FilterInfo(props: FilterInfoProps) {
  const {
    location,
    enableDiffOverview,
    onViewJournalClick,
    onDiffOverviewClick,
  } = props;
  const {
    pathname,
    query: { since, resource_name },
  } = location;

  const listURL =
    pathname + "?" + new URLSearchParams({ since, resource_name }).toString();

  return (
    <p>
      Since {since ? humanDate(since) : ""}.{" "}
      <a
        href="#"
        onClick={event => {
          event.preventDefault();
          document.location.hash = listURL;
          onViewJournalClick();
        }}
      >
        List view
      </a>
      {enableDiffOverview && since != null && (
        <span>
          {" | "}
          <a
            href="#"
            onClick={event => {
              event.preventDefault();
              onDiffOverviewClick(since);
            }}
          >
            Diff view
          </a>
        </span>
      )}
    </p>
  );
}

type DiffOverviewProps = {
  source: RecordData[];
  target: RecordData[];
  since: string;
};

function DiffOverview({ source, target, since }: DiffOverviewProps) {
  if (!source || !target) {
    // When something goes wrong while retrieving history (notification is shown).
    return null;
  }

  return (
    <div>
      <div className="alert alert-info">
        <p>
          This diff overview is computed against the current list of records in
          this collection and the list it contained on <b>{humanDate(since)}</b>
          .
        </p>
        <p>
          <b>Note:</b> <code>last_modified</code> and <code>schema</code> record
          metadata are omitted for easier review.
        </p>
      </div>

      <Diff source={source} target={target} />
    </div>
  );
}

type HistoryTableProps = {
  bid: string;
  cid?: string;
  location: Location;
  history: ResourceHistoryEntry[];
  historyLoaded: boolean;
  hasNextHistory: boolean;
  listNextHistory?: (...args: any) => any;
  enableDiffOverview: boolean;
  notifyError: typeof NotificationActions.notifyError;
};

type HistoryTableState = {
  diffOverview: boolean;
  busy: boolean;
  current?: RecordData[];
  previous?: RecordData[];
};

export default class HistoryTable extends PureComponent<
  HistoryTableProps,
  HistoryTableState
> {
  static defaultProps = {
    enableDiffOverview: false,
  };

  constructor(props: HistoryTableProps) {
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
    this.setState({ busy: true, diffOverview: true });
    fetchCollectionStateAt(bid, cid)
      .then(current => {
        this.setState({ current });
        return fetchCollectionStateAt(bid, cid, since);
      })
      .then(previous => {
        this.setState({ previous, busy: false });
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
      location,
    } = this.props;
    const { busy } = this.state;
    const { current, previous, diffOverview } = this.state;
    const query = parseHistoryFilters(location.search);
    const routeLocation = { pathname: location.pathname, query };
    const { since } = query;
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

    const tbody = (
      <tbody className={!historyLoaded ? "loading" : ""}>
        {history.length === 0 ? (
          <tr>
            <td colSpan={6}>
              {historyLoaded ? "No history entry found." : <Spinner />}
            </td>
          </tr>
        ) : (
          history.map((entry, index) => {
            return (
              <HistoryRow
                key={index}
                pos={index}
                enableDiffOverview={enableDiffOverview}
                bid={bid}
                entry={entry}
              />
            );
          })
        )}
      </tbody>
    );

    return (
      <div>
        {isFiltered && (
          <FilterInfo
            location={routeLocation}
            enableDiffOverview={enableDiffOverview}
            onDiffOverviewClick={this.onDiffOverviewClick}
            onViewJournalClick={this.onViewJournalClick}
          />
        )}
        {busy ? (
          <Spinner />
        ) : diffOverview ? (
          <DiffOverview since={since} source={previous} target={current} />
        ) : (
          <PaginatedTable
            colSpan={6}
            thead={thead}
            tbody={tbody}
            dataLoaded={historyLoaded}
            hasNextPage={hasNextHistory}
            listNextPage={listNextHistory}
          />
        )}
      </div>
    );
  }
}
