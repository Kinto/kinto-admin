import Spinner from "../Spinner";
import AdminLink from "@src/components/AdminLink";
import { usePermissions, useServerInfo } from "@src/hooks/session";
import { canCreateGroup } from "@src/permission";
import { timeago } from "@src/utils";
import React from "react";
import { Gear } from "react-bootstrap-icons";
import { ClockHistory } from "react-bootstrap-icons";

export function DataList(props) {
  const serverInfo = useServerInfo();
  const { bid, groups, showSpinner } = props;
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
        {showSpinner && (
          <tr>
            <td colSpan={4}>
              <Spinner />
            </td>
          </tr>
        )}
        {groups &&
          groups.map((group, index) => {
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
                    {serverInfo && "history" in serverInfo.capabilities && (
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

export function ListActions({ bid, busy }) {
  const permissions = usePermissions();
  if (busy || !canCreateGroup(permissions, bid)) {
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
