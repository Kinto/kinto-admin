import React, { Component } from "react";
import { Link } from "react-router";

import BucketTabs from "./BucketTabs";


function DataList(props) {
  const {bid, data, listLoaded} = props;
  return (
    <table className="table table-striped table-bordered record-list">
      <thead>
        <tr>
          <th>Name</th>
          <th>Schema</th>
          <th>Cache Expires</th>
          <th>Last mod.</th>
          <th />
        </tr>
      </thead>
      <tbody className={!listLoaded ? "loading" : ""}>{
        data.map((collection, index) => {
          const {id, schema, cache_expires, last_modified} = collection;
          return (
            <tr key={index}>
              <td>{id}</td>
              <td>{schema ? "Yes" : "No"}</td>
              <td>{cache_expires ? `${cache_expires} seconds` : "No" }</td>
              <td>{last_modified}</td>
              <td className="text-center">
                <div className="btn-group">
                  <Link to={`/buckets/${bid}/collections/${id}`}
                        className="btn btn-sm btn-default"
                        title="Browse collection">
                    <i className="glyphicon glyphicon-align-justify" />
                  </Link>
                  <Link to={`/buckets/${bid}/collections/${id}/history`}
                        className="btn btn-sm btn-default"
                        title="View collection history">
                    <i className="glyphicon glyphicon-time" />
                  </Link>
                  <Link to={`/buckets/${bid}/collections/${id}/edit`}
                        className="btn btn-sm btn-default"
                        title="Edit collection properties">
                    <i className="glyphicon glyphicon-cog" />
                  </Link>
                </div>
              </td>
            </tr>
          );
        })
      }</tbody>
    </table>
  );
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
              <p>This bucket has no collections.</p>
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
