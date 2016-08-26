import React, { Component } from "react";
import { Link } from "react-router";

import BucketTabs from "./BucketTabs";


function DataList(props) {
  const {bid, data, groupsLoaded} = props;
  return (
    <table className="table table-striped table-bordered record-list">
      <thead>
        <tr>
          <th>Name</th>
          <th>Members</th>
          <th>Last mod.</th>
        </tr>
      </thead>
      <tbody className={!groupsLoaded ? "loading" : ""}>{
        data.map((group, index) => {
          const {id, members, last_modified} = group;
          return (
            <tr key={index}>
              <td>
                <Link to={`/buckets/${bid}/groups/${id}/edit`}>
                  {id}
                </Link>
              </td>
              <td>{members.join(", ")}</td>
              <td>{last_modified}</td>
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
    const {groups, groupsLoaded} = bucket;

    return (
      <div>
        <h1>Groups of <b>{bid}</b></h1>
        <BucketTabs
          bid={bid}
          selected="groups"
          capabilities={capabilities}>
          { groupsLoaded && groups.length === 0 ?
            <div className="alert alert-info">
              <p>This bucket has no groups.</p>
            </div>
            :
            <DataList bid={bid}
                      data={groups}
                      groupsLoaded={groupsLoaded} />
          }
        </BucketTabs>
      </div>
    );
  }
}
