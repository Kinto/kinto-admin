import React, { Component } from "react";
import { Link } from "react-router";

import BucketTabs from "./BucketTabs";


class DataList extends Component {
  render() {
    const {
      bid,
      data,
      listLoaded,
    } = this.props;
    return (
      <table className="table table-striped table-bordered record-list">
        <thead>
          <tr>
            <th>Name</th>
            <th>Schema</th>
            <th>Cache Expires</th>
            <th>Last mod.</th>
          </tr>
        </thead>
        <tbody className={!listLoaded ? "loading" : ""}>{
          data.map((collection, index) => {
            return (
              <tr key={index}>
                <td>
                  <Link to={`/buckets/${bid}/collections/${collection.id}/edit`}>
                  {collection.id}
                  </Link>
                </td>
                <td>{collection.schema ? "Yes" : "No"}</td>
                <td>{collection.cache_expires ? `${collection.cache_expires} seconds` : "No" }</td>
                <td>{collection.last_modified}</td>
              </tr>
            );
          })
        }</tbody>
      </table>
    );
  }
}


export default class BucketCollections extends Component {
  render() {
    const {params, bucket, capabilities} = this.props;
    const {bid} = params;
    const {collections, listLoaded} = bucket;

    return (
      <div>
        <h1>Collections of <b>{bid}</b></h1>
        <BucketTabs
          bid={bid}
          selected="collections"
          capabilities={capabilities}>
          { listLoaded && collections.length === 0 ?
            <div className="alert alert-info">
              <p>This bucket has no collection.</p>
            </div>
            :
            <DataList bid={bid}
                      data={collections}
                      listLoaded={listLoaded} />
          }
        </BucketTabs>
      </div>
    );
  }
}
