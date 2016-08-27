import React, { Component } from "react";
import { Link } from "react-router";

import BucketTabs from "./BucketTabs";


function DataList(props) {
  const {bid, data, capabilities, groupsLoaded} = props;
  return (
    <table className="table table-striped table-bordered record-list">
      <thead>
        <tr>
          <th>Name</th>
          <th>Members</th>
          <th>Last mod.</th>
          <th>Actions</th>
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
              <td className="actions">
                <div className="btn-group">
                  {"history" in capabilities ?
                    <Link to={`/buckets/${bid}/groups/${id}/history`}
                          className="btn btn-xs btn-default"
                          title="View group history">
                      <i className="glyphicon glyphicon-time" />
                    </Link> : null}
                  <Link to={`/buckets/${bid}/groups/${id}/edit`}
                        className="btn btn-xs btn-default"
                        title="Edit groups properties">
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


function ListActions(props) {
  const {bid, session, bucket} = props;
  if (session.busy || bucket.busy) {
    return null;
  }
  return (
    <div className="list-actions">
      <Link to={`/buckets/${bid}/groups/create`}
            className="btn btn-info btn-group-add">Add</Link>
    </div>
  );
}


export default class BucketCollections extends Component {
  render() {
    const {params, session, bucket, capabilities} = this.props;
    const {bid} = params;
    const {groups, groupsLoaded} = bucket;

    const listActions = (
      <ListActions
        bid={bid}
        session={session}
        bucket={bucket} />
    );

    return (
      <div className="list-page">
        <h1>Groups of <b>{bid}</b></h1>
        <BucketTabs
          bid={bid}
          selected="groups"
          capabilities={capabilities}>
          {listActions }
          {groupsLoaded && groups.length === 0 ?
            <div className="alert alert-info">
              <p>This bucket has no groups.</p>
            </div>
            :
            <DataList bid={bid}
                      data={groups}
                      groupsLoaded={groupsLoaded}
                      capabilities={capabilities} />
          }
          {listActions}
        </BucketTabs>
      </div>
    );
  }
}
