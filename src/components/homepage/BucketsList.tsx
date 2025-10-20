import HumanDate from "../HumanDate";
import Spinner from "../Spinner";
import HomePageTabs from "./HomePageTabs";
import AdminLink from "@src/components/AdminLink";
import PaginatedTable from "@src/components/PaginatedTable";
import { useBucketList } from "@src/hooks/bucket";
import { usePermissions, useServerInfo } from "@src/hooks/session";
import { canCreateBucket } from "@src/permission";
import { BucketData, ServerInfo } from "@src/types";
import React from "react";
import {
  ClockHistory,
  Gear,
  Justify,
  Lock,
  PersonFill,
} from "react-bootstrap-icons";

interface ListActionsProps {
  busy: boolean;
}
export function ListActions({ busy }: ListActionsProps) {
  const permissions = usePermissions();
  if (busy || !canCreateBucket(permissions)) {
    return null;
  }
  return (
    <div className="list-actions">
      <AdminLink
        name="bucket:create"
        params={{}}
        className="btn btn-info btn-bucket-add"
      >
        Create bucket
      </AdminLink>
    </div>
  );
}

interface DataListProps {
  serverInfo: ServerInfo;
  buckets: BucketData[];
  showSpinner: boolean;
}
export function DataList(props: DataListProps) {
  const { serverInfo, buckets, showSpinner } = props;

  if (showSpinner) {
    return <Spinner />;
  }

  const thead = (
    <thead>
      <tr>
        <th>Id</th>
        <th>Last modified</th>
        <th>Actions</th>
      </tr>
    </thead>
  );

  const tbody = (
    <tbody className={""}>
      {buckets?.map((bucket, index) => {
        const { id: bid, last_modified } = bucket;
        return (
          <tr key={index}>
            <td>
              <AdminLink name="bucket:collections" params={{ bid }}>
                {bid}
              </AdminLink>
            </td>
            <td>
              <HumanDate timestamp={last_modified} />
            </td>
            <td className="actions">
              <div className="btn-group">
                {[
                  {
                    name: "bucket:collections",
                    icon: Justify,
                    label: "Collections",
                    key: "collections",
                  },
                  {
                    name: "bucket:groups",
                    icon: PersonFill,
                    label: "Groups",
                    key: "groups",
                  },
                  {
                    name: "bucket:attributes",
                    icon: Gear,
                    label: "Attributes",
                    key: "attributes",
                  },
                  {
                    name: "bucket:permissions",
                    icon: Lock,
                    label: "Permissions",
                    key: "permissions",
                  },
                ].map(({ name, icon: Icon, label, key }) => (
                  <AdminLink
                    key={key}
                    name={name}
                    params={{ bid }}
                    className="btn btn-sm btn-secondary"
                    title={label}
                  >
                    <Icon className="icon" />
                  </AdminLink>
                ))}
                {serverInfo && "history" in serverInfo.capabilities && (
                  <AdminLink
                    name="bucket:history"
                    params={{ bid }}
                    className="btn btn-sm btn-secondary"
                    title="View bucket history"
                  >
                    <ClockHistory className="icon" />
                  </AdminLink>
                )}
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
      colSpan={3}
      // useBucketList() does not support pagination.
      dataLoaded={true}
      hasNextPage={false}
    />
  );
}

export default function BucketsList() {
  const buckets = useBucketList();
  const serverInfo = useServerInfo();

  const listActions = <ListActions busy={!buckets} />;
  return (
    <div className="list-page">
      <h1>
        Buckets of <b>{serverInfo?.project_name}</b>
      </h1>
      <HomePageTabs selected="buckets">
        {listActions}
        {buckets?.length === 0 ? (
          <div className="alert alert-info">
            <p>This server has no visible buckets.</p>
          </div>
        ) : (
          <DataList
            serverInfo={serverInfo}
            buckets={buckets}
            showSpinner={!buckets}
          />
        )}
      </HomePageTabs>
    </div>
  );
}
