import React, { Component } from "react";

import { timeago } from "../../utils";
import AdminLink from "../AdminLink";
import BucketTabs from "./BucketTabs";


function DataList(props) {
  const {bid, data, capabilities, collectionsLoaded} = props;
  return (
    <table className="table table-striped table-bordered record-list">
      <thead>
        <tr>
          <th>Name</th>
          <th>Schema</th>
          <th>Cache Expires</th>
          <th>Last mod.</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody className={!collectionsLoaded ? "loading" : ""}>{
        data.map((collection, index) => {
          const {id: cid, schema, cache_expires, last_modified} = collection;
          const date = new Date(last_modified).toISOString();
          return (
            <tr key={index}>
              <td>{cid}</td>
              <td>{schema ? "Yes" : "No"}</td>
              <td>{cache_expires ? `${cache_expires} seconds` : "No" }</td>
              <td><span title={date}>{timeago(date)}</span></td>
              <td className="actions">
                <div className="btn-group">
                  <AdminLink name="collection:records" params={{bid, cid}}
                    className="btn btn-xs btn-default" title="Browse collection">
                    <i className="glyphicon glyphicon-align-justify" />
                  </AdminLink>
                  {"history" in capabilities ?
                    <AdminLink name="collection:history" params={{bid, cid}}
                      className="btn btn-xs btn-default" title="View collection history">
                      <i className="glyphicon glyphicon-time" />
                    </AdminLink> : null}
                  <AdminLink name="collection:attributes" params={{bid, cid}}
                     className="btn btn-xs btn-default" title="Edit collection attributes">
                    <i className="glyphicon glyphicon-cog" />
                  </AdminLink>
                </div>
              </td>
            </tr>
          );
        })
      }</tbody>
    </table>
  );
}


function ListActions(props) {
  const {bid, session, bucket} = props;
  if (session.busy || bucket.busy) {
    return null;
  }
  return (
    <div className="list-actions">
      <AdminLink name="collection:create" params={{bid}}
            className="btn btn-info btn-collection-add">Add</AdminLink>
    </div>
  );
}


export default class BucketCollections extends Component {
  render() {
    const {params, session, bucket, capabilities} = this.props;
    const {bid} = params;
    const {collections, collectionsLoaded} = bucket;

    const listActions = (
      <ListActions
        bid={bid}
        session={session}
        bucket={bucket} />
    );

    return (
      <div className="list-page">
        <h1>Collections of <b>{bid}</b></h1>
        <BucketTabs
          bid={bid}
          selected="collections"
          capabilities={capabilities}>
          {listActions}
          {collectionsLoaded && collections.length === 0 ?
            <div className="alert alert-info">
              <p>This bucket has no collections.</p>
            </div>
            :
            <DataList bid={bid}
                      data={collections}
                      collectionsLoaded={collectionsLoaded}
                      capabilities={capabilities} />
          }
          {listActions}
        </BucketTabs>
      </div>
    );
  }
}
