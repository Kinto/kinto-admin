import type {
  Capabilities,
  BucketState,
  SessionState,
  BucketRouteMatch,
} from "../../types";

import React, { PureComponent } from "react";

import { Gear } from "react-bootstrap-icons";
import { ClockHistory } from "react-bootstrap-icons";

import { timeago } from "../../utils";
import AdminLink from "../AdminLink";
import BucketTabs from "./BucketTabs";

function DataList(props) {
  const { bid, groups, capabilities } = props;
  return (
    <table className="table table-striped table-bordered record-list">
      <thead>
        <tr>
          <th>Id</th>
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
                  {"history" in capabilities && (
                    <AdminLink
                      name="group:history"
                      params={{ bid, gid }}
                      className="btn btn-sm btn-secondary"
                      title="View group history"
                    >
                      <ClockHistory className="icon" />
                    </AdminLink>
                  )}
                  <AdminLink
                    name="group:attributes"
                    params={{ bid, gid }}
                    className="btn btn-sm btn-secondary"
                    title="Edit groups attributes"
                  >
                    <Gear className="icon" />
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
        className="btn btn-info btn-group-add"
      >
        Create group
      </AdminLink>
    </div>
  );
}

export type OwnProps = {
  match: BucketRouteMatch;
};

export type StateProps = {
  session: SessionState;
  bucket: BucketState;
  capabilities: Capabilities;
};

export type Props = OwnProps & StateProps;

export default class BucketCollections extends PureComponent<Props> {
  render() {
    const { match, session, bucket, capabilities } = this.props;
    const {
      params: { bid },
    } = match;
    const { groups } = bucket;

    const listActions = (
      <ListActions bid={bid} session={session} bucket={bucket} />
    );

    return (
      <div className="list-page">
        <h1>
          Groups of <b>{bid}</b>
        </h1>
        <BucketTabs bid={bid} selected="groups" capabilities={capabilities}>
          {listActions}
          {groups.length === 0 ? (
            <div className="alert alert-info">
              <p>This bucket has no groups.</p>
            </div>
          ) : (
            <DataList bid={bid} groups={groups} capabilities={capabilities} />
          )}
          {listActions}
        </BucketTabs>
      </div>
    );
  }
}
