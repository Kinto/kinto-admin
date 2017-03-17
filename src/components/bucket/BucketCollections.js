/* @flow */
import type {
  Capabilities,
  BucketState,
  SessionState,
  BucketRouteParams,
} from "../../types";

import React, { PureComponent } from "react";

import { timeago } from "../../utils";
import AdminLink from "../AdminLink";
import BucketTabs from "./BucketTabs";
import PaginatedTable from "../PaginatedTable";

function DataList(props) {
  const { bid, collections, capabilities, listBucketNextCollections } = props;
  const { loaded, entries, hasNextPage } = collections;
  const thead = (
    <thead>
      <tr>
        <th>Name</th>
        <th>Schema</th>
        <th>Cache Expires</th>
        <th>Last mod.</th>
        <th>Actions</th>
      </tr>
    </thead>
  );

  const tbody = (
    <tbody className={!loaded ? "loading" : ""}>
      {entries.map((collection, index) => {
        const { id: cid, schema, cache_expires, last_modified } = collection;
        const date = new Date(last_modified);
        return (
          <tr key={index}>
            <td>{cid}</td>
            <td>{schema ? "Yes" : "No"}</td>
            <td>{cache_expires ? `${cache_expires} seconds` : "No"}</td>
            <td>
              <span title={date.toISOString()}>{timeago(date.getTime())}</span>
            </td>
            <td className="actions">
              <div className="btn-group">
                <AdminLink
                  name="collection:records"
                  params={{ bid, cid }}
                  className="btn btn-xs btn-default"
                  title="Browse collection">
                  <i className="glyphicon glyphicon-align-justify" />
                </AdminLink>
                {"history" in capabilities &&
                  <AdminLink
                    name="collection:history"
                    params={{ bid, cid }}
                    className="btn btn-xs btn-default"
                    title="View collection history">
                    <i className="glyphicon glyphicon-time" />
                  </AdminLink>}
                <AdminLink
                  name="collection:attributes"
                  params={{ bid, cid }}
                  className="btn btn-xs btn-default"
                  title="Edit collection attributes">
                  <i className="glyphicon glyphicon-cog" />
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

function ListActions(props) {
  const { bid, session, bucket } = props;
  if (session.busy || bucket.busy) {
    return null;
  }
  return (
    <div className="list-actions">
      <AdminLink
        name="collection:create"
        params={{ bid }}
        className="btn btn-info btn-collection-add">
        Add
      </AdminLink>
    </div>
  );
}

export default class BucketCollections extends PureComponent {
  props: {
    params: BucketRouteParams,
    session: SessionState,
    bucket: BucketState,
    capabilities: Capabilities,
    listBucketNextCollections: () => void,
  };

  render() {
    const {
      params,
      session,
      bucket,
      capabilities,
      listBucketNextCollections,
    } = this.props;
    const { bid } = params;
    const { collections } = bucket;

    const listActions = (
      <ListActions bid={bid} session={session} bucket={bucket} />
    );

    return (
      <div className="list-page">
        <h1>Collections of <b>{bid}</b></h1>
        <BucketTabs
          bid={bid}
          selected="collections"
          capabilities={capabilities}>
          {listActions}
          {collections.loaded && collections.entries.length === 0
            ? <div className="alert alert-info">
                <p>This bucket has no collections.</p>
              </div>
            : <DataList
                bid={bid}
                collections={collections}
                listBucketNextCollections={listBucketNextCollections}
                capabilities={capabilities}
              />}
          {listActions}
        </BucketTabs>
      </div>
    );
  }
}
