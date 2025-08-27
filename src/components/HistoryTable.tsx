import AdminLink from "./AdminLink";
import HumanDate from "./HumanDate";
import PaginatedTable from "./PaginatedTable";
import Spinner from "./Spinner";
import { getClient } from "@src/client";
import { useShowNonHumans, useShowSignerPlugin } from "@src/hooks/preferences";
import { useServerInfo } from "@src/hooks/session";
import type { HistoryFilters, ResourceHistoryEntry } from "@src/types";
import { diffJson, hasHistoryDisabled } from "@src/utils";
import { sortHistoryEntryPermissions } from "@src/utils";
import React, { useState } from "react";
import {
  ArrowClockwise,
  Check2Circle,
  CheckCircleFill,
  CheckSquare,
  Eye,
  FileDiff,
  FileEarmark,
  Folder2,
  Justify,
  Pencil,
  People,
  Plus,
  Trash,
} from "react-bootstrap-icons";
import { EyeSlash } from "react-bootstrap-icons";

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

interface HistoryRowProps {
  bid: string;
  entry: ResourceHistoryEntry;
  pos: number;
}

function HistoryRow({ bid, entry, pos }: HistoryRowProps) {
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

  // We turn sign-off operations into real verbs.
  let shownAction =
    resource_name === "collection" &&
    action === "update" &&
    // Note: we don't do reject here since we can distinguish it from
    // a collection metadata change without querying the previous state.
    target.data.status != "work-in-progress"
      ? target.data.status
      : action;
  shownAction =
    {
      create: (
        <>
          <Plus /> create
        </>
      ),
      update: (
        <>
          <Pencil /> update
        </>
      ),
      delete: (
        <>
          <Trash /> delete
        </>
      ),
      "to-sign": (
        <>
          <CheckCircleFill /> approve
        </>
      ),
      "to-review": (
        <>
          <CheckSquare /> request
        </>
      ),
      "to-rollback": (
        <>
          <ArrowClockwise /> rollback
        </>
      ),
      "to-resign": (
        <>
          <ArrowClockwise /> resign
        </>
      ),
      signed: (
        <>
          <Check2Circle /> sign
        </>
      ),
    }[shownAction] || shownAction;

  const shownResource =
    {
      bucket: (
        <>
          <Folder2 /> collection
        </>
      ),
      group: (
        <>
          <People /> collection
        </>
      ),
      collection: (
        <>
          <Justify /> collection
        </>
      ),
      record: (
        <>
          <FileEarmark /> record
        </>
      ),
    }[resource_name] || resource_name;

  return (
    <React.Fragment>
      <tr>
        <td className="lastmod">
          <HumanDate timestamp={last_modified} />
        </td>
        <td>{shownAction}</td>
        <td>{shownResource}</td>
        <td>
          <AdminLink
            name={`${resource_name}:attributes`}
            params={{ bid, cid, gid, rid }}
          >
            {objectId}
          </AdminLink>
        </td>
        <td>{user_id}</td>
        <td className="actions">
          <div className="btn-group">
            <button
              className="btn btn-sm btn-secondary"
              onClick={toggle}
              title="View entry details"
            >
              {open ? <EyeSlash className="icon" /> : <Eye className="icon" />}
            </button>
            {resource_name == "record" ? (
              <AdminLink
                name="collection:compare"
                params={{ bid, cid }}
                query={`target=${bid}/${cid}@${last_modified}`}
                className="btn btn-sm btn-secondary"
                title="Compare with this version"
              >
                <FileDiff className="icon" />
              </AdminLink>
            ) : null}
          </div>
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

interface HistoryTableProps {
  bid: string;
  cid?: string;
  history: ResourceHistoryEntry[];
  historyLoaded: boolean;
  hasNextHistory: boolean;
  listNextHistory?;
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
}: HistoryTableProps) {
  const [loading, setLoading] = useState(false);

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
  if (hasHistoryDisabled(serverInfo, bid, cid)) {
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
          return <HistoryRow key={index} pos={index} bid={bid} entry={entry} />;
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
      <PaginatedTable
        colSpan={6}
        thead={thead}
        tbody={tbody}
        dataLoaded={historyLoaded}
        hasNextPage={hasNextHistory}
        listNextPage={nextHistoryWrapper}
      />
    </div>
  );
}
