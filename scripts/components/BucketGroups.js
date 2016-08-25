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
            <th>Members</th>
            <th>Last mod.</th>
          </tr>
        </thead>
        <tbody className={!listLoaded ? "loading" : ""}>{
          data.map((group, index) => {
            return (
              <tr key={index}>
                <td>
                  <Link to={`/buckets/${bid}/groups/${group.id}/edit`}>
                  {group.id}
                  </Link>
                </td>
                <td>{group.members.join(", ")}</td>
                <td>{group.last_modified}</td>
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
    const {groups, listLoaded} = bucket;

    return (
      <div>
        <h1>Groups of <b>{bid}</b></h1>
        <BucketTabs
          bid={bid}
          selected="groups"
          capabilities={capabilities}>
          { listLoaded && groups.length === 0 ?
            <div className="alert alert-info">
              <p>This bucket has no groups.</p>
            </div>
            :
            <DataList bid={bid}
                      data={groups}
                      listLoaded={listLoaded} />
          }
        </BucketTabs>
      </div>
    );
  }
}
