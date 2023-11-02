import React from "react";

import { Gear, Justify, ClockHistory } from "react-bootstrap-icons";

import { timeago } from "../../utils";
import AdminLink from "../AdminLink";
import PaginatedTable from "../PaginatedTable";

export function ListActions(props) {
  const { bid, session, bucket } = props;
  if (session.busy || bucket.busy) {
    return null;
  }
  return (
    <div className="list-actions">
      <AdminLink
        name="collection:create"
        params={{ bid }}
        className="btn btn-info btn-collection-add"
      >
        Create collection
      </AdminLink>
    </div>
  );
}

export function DataList(props) {
  const { bid, collections, capabilities, listBucketNextCollections } = props;
  const { loaded, entries, hasNextPage } = collections;
  const thead = (
    <thead>
      <tr>
        <th>Id</th>
        <th>Schema</th>
        <th>Attachments</th>
        <th>Cache Expires</th>
        <th>Last mod.</th>
        <th>Actions</th>
      </tr>
    </thead>
  );

  const tbody = (
    <tbody className={!loaded ? "loading" : ""}>
      {entries.map((collection, index) => {
        const {
          id: cid,
          schema,
          cache_expires,
          last_modified,
          attachment,
        } = collection;
        // FIXME: last_modified should always be here, but the types
        // don't express that
        const date = last_modified && new Date(last_modified);
        const ageString = date && timeago(date.getTime());
        return (
          <tr key={index}>
            <td>{cid}</td>
            <td>{schema ? "Yes" : "No"}</td>
            <td>
              {attachment ? (attachment.required ? "Required" : "Yes") : "No"}
            </td>
            <td>{cache_expires ? `${cache_expires} seconds` : "No"}</td>
            <td>
              <span title={date ? date.toISOString() : ""}>{ageString}</span>
            </td>
            <td className="actions">
              <div className="btn-group">
                <AdminLink
                  name="collection:records"
                  params={{ bid, cid }}
                  className="btn btn-sm btn-secondary"
                  title="Browse collection"
                >
                  <Justify className="icon" />
                </AdminLink>
                {"history" in capabilities && (
                  <AdminLink
                    name="collection:history"
                    params={{ bid, cid }}
                    className="btn btn-sm btn-secondary"
                    title="View collection history"
                  >
                    <ClockHistory className="icon" />
                  </AdminLink>
                )}
                <AdminLink
                  name="collection:attributes"
                  params={{ bid, cid }}
                  className="btn btn-sm btn-secondary"
                  title="Edit collection attributes"
                >
                  <Gear className="icon" />
                </AdminLink>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  );

  return (
    <PaginatedTable
      thead={thead}
      tbody={tbody}
      dataLoaded={loaded}
      colSpan={5}
      hasNextPage={hasNextPage}
      listNextPage={listBucketNextCollections}
    />
  );
}
