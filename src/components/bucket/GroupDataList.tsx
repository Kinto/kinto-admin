import HumanDate from "../HumanDate";
import Spinner from "../Spinner";
import AdminLink from "@src/components/AdminLink";
import PaginatedTable from "@src/components/PaginatedTable";
import { usePermissions, useServerInfo } from "@src/hooks/session";
import { canCreateGroup } from "@src/permission";
import { GroupData, ListResult } from "@src/types";
import React, { useState } from "react";
import { Gear } from "react-bootstrap-icons";
import { ClockHistory } from "react-bootstrap-icons";

interface ListActionsProps {
  bid: string;
  busy: boolean;
}
export function ListActions({ bid, busy }: ListActionsProps) {
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
interface DataListProps {
  bid: string;
  groups: ListResult<GroupData>;
  showSpinner: boolean;
}
export function DataList(props: DataListProps) {
  const [loading, setLoading] = useState(false);
  const serverInfo = useServerInfo();
  const { bid, groups, showSpinner } = props;

  if (showSpinner) {
    return <Spinner />;
  }

  const thead = (
    <thead>
      <tr>
        <th>Id</th>
        <th>Members</th>
        <th>Last modified</th>
        <th>Actions</th>
      </tr>
    </thead>
  );
  const { data, hasNextPage, next } = groups;
  const nextWrapper = async () => {
    setLoading(true);
    await next();
    setLoading(false);
  };

  const tbody = (
    <tbody className={""}>
      {data?.map((group, index) => {
        const { id: gid, members, last_modified } = group;
        return (
          <tr key={index}>
            <td>
              <AdminLink name="group:attributes" params={{ bid, gid }}>
                {gid}
              </AdminLink>
            </td>
            <td>{members.join(", ")}</td>
            <td>
              <HumanDate timestamp={last_modified} />
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
  );
  return (
    <PaginatedTable
      thead={thead}
      tbody={tbody}
      dataLoaded={!loading}
      colSpan={4}
      hasNextPage={hasNextPage}
      listNextPage={nextWrapper}
    />
  );
}
