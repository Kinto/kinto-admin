import RecordRow from "./RecordRow";
import { CommonProps } from "./commonPropTypes";
import AdminLink from "@src/components/AdminLink";
import PaginatedTable from "@src/components/PaginatedTable";
import SignoffContainer from "@src/containers/signoff/SignoffToolBar";
import { canCreateRecord } from "@src/permission";
import type { RecordData } from "@src/types";
import { capitalize } from "@src/utils";
import { PaginationResult } from "kinto/lib/http/base";
import React, { useState } from "react";
import { SortUp } from "react-bootstrap-icons";
import { SortDown } from "react-bootstrap-icons";

export function ListActions(props) {
  const { bid, cid, session, collection, bucket } = props;
  if (session.busy || collection.busy) {
    return null;
  }
  return (
    <div className="list-actions">
      {canCreateRecord(session, bucket.data?.id, collection) && (
        <>
          <AdminLink
            key="__1"
            name="record:create"
            params={{ bid, cid }}
            className="btn btn-info btn-record-add"
          >
            Create record
          </AdminLink>
          <AdminLink
            key="__2"
            name="record:bulk"
            params={{ bid, cid }}
            className="btn btn-info btn-record-bulk-add"
          >
            Bulk create
          </AdminLink>
        </>
      )}
      {/* won't render if the signer capability is not enabled on the server
         or collection not configured to be signed */}
      <SignoffContainer key="request-signoff-toolbar" />
    </div>
  );
}

export function SortLink(props) {
  const { dir, active, column, updateSort } = props;
  return (
    <a
      href="#"
      className={`sort-link ${active ? "active badge badge-secondary" : ""}`}
      onClick={event => {
        event.preventDefault();
        if (active) {
          // Perform the opposite action from current state to make the link act
          // as a toggler.
          updateSort(dir === "up" ? `-${column}` : column);
        } else {
          // by default use ASC order
          updateSort(column);
        }
      }}
    >
      {dir === "up" ? (
        <SortUp className="icon" />
      ) : (
        <SortDown className="icon" />
      )}
    </a>
  );
}

export function ColumnSortLink(props) {
  const { column, currentSort, updateSort } = props;
  if (!currentSort || column === "__json") {
    return null;
  }
  let active, direction;
  // Check if we're currently sorting on this field.
  if (new RegExp(`^-?${column}$`).test(currentSort)) {
    // We're sorting on this field; check for direction.
    active = true;
    direction = currentSort.startsWith("-") ? "down" : "up";
  } else {
    // By default, expose links to sort ASC.
    active = false;
    direction = "up";
  }
  return (
    <SortLink
      active={active}
      dir={direction}
      column={column}
      updateSort={updateSort}
    />
  );
}

type RecordsViewProps = CommonProps & {
  bid: string;
  cid: string;
  displayFields: string[];
  schema: any;
};

type TableProps = RecordsViewProps & {
  currentSort: string;
  hasNextRecords: boolean;
  listNextRecords?: Promise<PaginationResult<RecordData>>;
  records: RecordData[];
  recordsLoaded: boolean;
  updateSort: (s: string) => void;
};

export default function RecordTable({
  bid,
  cid,
  records,
  recordsLoaded,
  hasNextRecords,
  listNextRecords,
  currentSort,
  schema,
  displayFields,
  deleteRecord,
  updateSort,
  redirectTo,
  capabilities,
}: TableProps) {
  const [filter, setFilter] = useState("");

  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const getFieldTitle = displayField => {
    if (displayField === "__json") {
      return "Data";
    }
    if (
      isSchemaProperty(displayField) &&
      "title" in schema.properties[displayField]
    ) {
      return schema.properties[displayField].title;
    }
    return capitalize(displayField);
  };

  const isSchemaProperty = displayField => {
    return schema && schema.properties && displayField in schema.properties;
  };

  if (recordsLoaded && records.length === 0) {
    return (
      <div className="alert alert-info">
        <p>This collection has no records.</p>
      </div>
    );
  }

  if (filter && records.length) {
    records = records.filter(x =>
      JSON.stringify(x).match(new RegExp(filter, "i"))
    );
  }

  const thead = (
    <thead>
      <tr>
        {displayFields.map((displayField, index) => (
          <th key={index}>
            {getFieldTitle(displayField)}
            {isSchemaProperty(displayField) && (
              <ColumnSortLink
                currentSort={currentSort}
                column={displayField}
                updateSort={updateSort}
              />
            )}
          </th>
        ))}
        <th>
          Last mod.
          <ColumnSortLink
            currentSort={currentSort}
            column="last_modified"
            updateSort={updateSort}
          />
        </th>
        <th />
      </tr>
    </thead>
  );

  const tbody = (
    <tbody className={!recordsLoaded ? "loading" : ""}>
      {records.map((record, index) => (
        <RecordRow
          key={index}
          bid={bid}
          cid={cid}
          record={record}
          schema={schema}
          displayFields={displayFields}
          deleteRecord={deleteRecord}
          redirectTo={redirectTo}
          capabilities={capabilities}
        />
      ))}
    </tbody>
  );

  return (
    <>
      <input
        type="text"
        className="form-control quickFilter"
        placeholder="Quicksearch"
        onChange={onFilterChange}
        value={filter}
        data-testid="quickFilter"
      />
      <PaginatedTable
        thead={thead}
        tbody={tbody}
        dataLoaded={recordsLoaded}
        colSpan={displayFields.length + 2}
        hasNextPage={hasNextRecords}
        listNextPage={listNextRecords}
      />
    </>
  );
}
