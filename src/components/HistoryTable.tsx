import AdminLink from "./AdminLink";
import PaginatedTable from "./PaginatedTable";
import Spinner from "./Spinner";
import { getClient } from "@src/client";
import { notifyError } from "@src/hooks/notifications";
import { useShowNonHumans, useShowSignerPlugin } from "@src/hooks/preferences";
import { useServerInfo } from "@src/hooks/session";
import type {
  HistoryFilters,
  RecordData,
  ResourceHistoryEntry,
} from "@src/types";
import { diffJson, humanDate, timeago } from "@src/utils";
import { omit, sortHistoryEntryPermissions } from "@src/utils";
import React, { useState } from "react";
import { Eye } from "react-bootstrap-icons";
import { EyeSlash } from "react-bootstrap-icons";
import { SkipStart } from "react-bootstrap-icons";

function Diff({ source, target }: { source: any; target: any }) {
  const diff = diffJson(source, target);
  return (
    <pre className="json-record">
      {diff.map((chunk: string, i) => {
        let className = "";
        if (chunk.startsWith("+")) {
          className = "added";
        } else if (chunk.startsWith("-")) {
          className = "removed";
        }
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
): Promise<object[]> {
  const coll = getClient().bucket(bid).collection(cid);
  const query = timestamp ? { at: parseInt(timestamp, 10) } : {};
  return coll.listRecords(query).then(({ data: records }) => {
    // clean entries for easier review
    return records
      .map(record => omit(record, ["last_modified", "schema"]))
      .sort((a, b) => (a.id > b.id ? 1 : -1));
  });
}

interface HistoryRowProps {
  bid: string;
  entry: ResourceHistoryEntry;
  pos: number;
  enableDiffOverview: boolean;
}

function HistoryRow({
  bid,
  entry,
  pos,
  enableDiffOverview = false,
}: HistoryRowProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previous, setPrevious] = useState(null);
  const [error, setError] = useState(null);

  const toggle = async event => {
    event.preventDefault();
    if (entry.action !== "update") {
      return setOpen(!open);
    }
    if (open) {
      return setOpen(false);
    }
    if (previous) {
      return setOpen(true);
    }

    setBusy(true);
    try {
      const fetchedPrevious = await fetchPreviousVersion(bid, entry);
      if (fetchedPrevious === null) {
        setOpen(false);
        setBusy(false);
        setPrevious(null);
        setError(new Error("Couldn't fetch previous history entry."));
      } else {
        setOpen(true);
        setBusy(false);
        setPrevious(sortHistoryEntryPermissions(fetchedPrevious));
        setError(null);
      }
    } catch (e) {
      setOpen(true);
      setBusy(false);
      setPrevious(null);
      setError(e);
    }
  };

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
          <span title={humanDate(last_modified)}>{timeago(last_modified)}</span>
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
            onClick={toggle}
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

interface FilterInfoProps {
  since: string;
  enableDiffOverview: boolean;
  onViewJournalClick: () => void;
  onDiffOverviewClick: (timestamp: string) => void;
}

function FilterInfo(props: FilterInfoProps) {
  const { since, enableDiffOverview, onViewJournalClick, onDiffOverviewClick } =
    props;

  return (
    <p>
      Since {since ? humanDate(since) : ""}.{" "}
      <a
        href="#"
        onClick={event => {
          event.preventDefault();
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

interface DiffOverviewProps {
  source: RecordData[];
  target: RecordData[];
  since: string;
}

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

interface HistoryTableProps {
  bid: string;
  cid?: string;
  history: ResourceHistoryEntry[];
  historyLoaded: boolean;
  hasNextHistory: boolean;
  listNextHistory?;
  enableDiffOverview?: boolean;
  initialFilters?: HistoryFilters;
  onFiltersChange: (filters: HistoryFilters) => void;
}

export default function HistoryTable({
  bid,
  cid,
  history,
  historyLoaded,
  hasNextHistory,
  listNextHistory,
  onFiltersChange,
  initialFilters = undefined,
  enableDiffOverview = false,
}: HistoryTableProps) {
  const [diffOverview, setDiffOverview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(null);
  const [previous, setPrevious] = useState(null);

  const serverInfo = useServerInfo();

  // GroupHistory, BucketHistory, and RecordHistory don't take filter
  // from URL and do not provide `initialFilters`.
  // CollectionHistory provide it and can pass `initialFilters.show_signer_plugin: false`.
  const [showSignerPlugin, setShowSignerPlugin] = useShowSignerPlugin(
    initialFilters?.show_signer_plugin !== undefined
      ? initialFilters.show_signer_plugin
      : true
  );
  const [showNonHumans, setShowNonHumans] = useShowNonHumans(
    initialFilters?.show_non_humans !== undefined
      ? initialFilters.show_non_humans
      : true
  );

  const handleNonHumanToggle = value => {
    setShowNonHumans(value);
    onFiltersChange({ ...initialFilters, show_non_humans: value });
  };

  const handleSignerToggle = value => {
    setShowSignerPlugin(value);
    onFiltersChange({ ...initialFilters, show_signer_plugin: value });
  };

  // Hide the non human filters if the server does not support openid or signer
  const hasOpenID = serverInfo && "openid" in serverInfo.capabilities;
  const hasSigner = serverInfo && "signer" in serverInfo.capabilities;

  // If collection history was disabled from server configuration, just show a warning.
  const wasDisabled = (
    serverInfo.capabilities.history?.excluded_resources || []
  ).some(
    resource =>
      resource.bucket == bid &&
      (resource.collection == cid || !resource.collection)
  );
  if (wasDisabled) {
    return (
      <div className="alert alert-warning" data-testid="warning">
        <p>History was disabled for this collection in server configuration.</p>
      </div>
    );
  }

  const nextHistoryWrapper = async () => {
    setLoading(true);
    await listNextHistory();
    setLoading(false);
  };

  const onDiffOverviewClick = async since => {
    if (!enableDiffOverview || cid == null) {
      return;
    }
    setBusy(true);
    setDiffOverview(true);
    try {
      const fetchedCurrent = await fetchCollectionStateAt(bid, cid);
      setCurrent(fetchedCurrent);
      const fetchedPrevious = await fetchCollectionStateAt(bid, cid, since);
      setPrevious(fetchedPrevious);
      setBusy(false);
    } catch (err) {
      notifyError("Couldn't compute records list diff overview", err);
      setDiffOverview(false);
      setBusy(false);
      setCurrent(null);
      setPrevious(null);
    }
  };

  const onViewJournalClick = () => {
    setDiffOverview(false);
    setCurrent(null);
    setPrevious(null);
  };

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
    <tbody className={!historyLoaded || loading ? "loading" : ""}>
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
      {hasOpenID && (
        <div className="form-check form-check-inline mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={showNonHumans}
            onChange={e => handleNonHumanToggle(e.currentTarget.checked)}
            id="showNonHumans"
            data-testid="showNonHumans"
          />
          <label className="form-check-label" htmlFor="showNonHumans">
            Show non humans entries
          </label>
        </div>
      )}
      {hasSigner && (
        <div className="form-check form-check-inline mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={showSignerPlugin && showNonHumans}
            onChange={e => handleSignerToggle(e.currentTarget.checked)}
            id="showSignerPlugin"
            data-testid="showSignerPlugin"
            disabled={!showNonHumans}
          />
          <label className="form-check-label" htmlFor="showSignerPlugin">
            Show plugin entries
          </label>
        </div>
      )}
      {!!initialFilters?.since && (
        <FilterInfo
          since={initialFilters?.since}
          enableDiffOverview={enableDiffOverview}
          onDiffOverviewClick={onDiffOverviewClick}
          onViewJournalClick={onViewJournalClick}
        />
      )}
      {busy ? (
        <Spinner />
      ) : diffOverview ? (
        <DiffOverview
          since={initialFilters?.since}
          source={previous}
          target={current}
        />
      ) : (
        <PaginatedTable
          colSpan={6}
          thead={thead}
          tbody={tbody}
          dataLoaded={historyLoaded}
          hasNextPage={hasNextHistory}
          listNextPage={nextHistoryWrapper}
        />
      )}
    </div>
  );
}
