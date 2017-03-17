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

function DataList(props) {
  const { bid, groups, capabilities } = props;
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
      <tbody>
        {groups.map((group, index) => {
          const { id: gid, members, last_modified } = group;
          const date = new Date(last_modified);
          return (
            <tr key={index}>
              <td>
                <AdminLink name="group:attributes" params={{ bid, gid }}>
                  {gid}
                </AdminLink>
              </td>
              <td>{members.join(", ")}</td>
              <td>
                <span title={date.toISOString()}>
                  {timeago(date.getTime())}
                </span>
              </td>
              <td className="actions">
                <div className="btn-group">
                  {"history" in capabilities &&
                    <AdminLink
                      name="group:history"
                      params={{ bid, gid }}
                      className="btn btn-xs btn-default"
                      title="View group history">
                      <i className="glyphicon glyphicon-time" />
                    </AdminLink>}
                  <AdminLink
                    name="group:attributes"
                    params={{ bid, gid }}
                    className="btn btn-xs btn-default"
                    title="Edit groups attributes">
                    <i className="glyphicon glyphicon-cog" />
                  </AdminLink>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ListActions({ bid, session, bucket }) {
  if (session.busy || bucket.busy) {
    return null;
  }
  return (
    <div className="list-actions">
      <AdminLink
        name="group:create"
        params={{ bid }}
        className="btn btn-info btn-group-add">
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
  };

  render() {
    const { params, session, bucket, capabilities } = this.props;
    const { bid } = params;
    const { groups } = bucket;

    const listActions = (
      <ListActions bid={bid} session={session} bucket={bucket} />
    );

    return (
      <div className="list-page">
        <h1>Groups of <b>{bid}</b></h1>
        <BucketTabs bid={bid} selected="groups" capabilities={capabilities}>
          {listActions}
          {groups.length === 0
            ? <div className="alert alert-info">
                <p>This bucket has no groups.</p>
              </div>
            : <DataList
                bid={bid}
                groups={groups}
                capabilities={capabilities}
              />}
          {listActions}
        </BucketTabs>
      </div>
    );
  }
}
