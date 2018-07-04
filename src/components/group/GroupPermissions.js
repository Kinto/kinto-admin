/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  GroupState,
  GroupRouteMatch,
  GroupPermissions,
} from "../../types";

import React, { PureComponent } from "react";

import Spinner from "../Spinner";
import GroupTabs from "./GroupTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditGroup } from "../../permission";

type Props = {
  match: GroupRouteMatch,
  session: SessionState,
  bucket: BucketState,
  group: GroupState,
  capabilities: Capabilities,
  updateGroup: (
    bid: string,
    gid: string,
    data: { permissions: GroupPermissions }
  ) => void,
};

export default class GroupPermissions_ extends PureComponent<Props> {
  onSubmit = ({ formData }: { formData: GroupPermissions }) => {
    const { match, updateGroup } = this.props;
    const { bid, gid } = match.params;
    updateGroup(bid, gid, { permissions: formData });
  };

  get readonly(): boolean {
    const { session, bucket, group } = this.props;
    return !canEditGroup(session, bucket, group);
  }

  render() {
    const { match, capabilities, bucket, group } = this.props;
    const { bid, gid } = match.params;
    const { busy, permissions } = group;
    const { groups } = bucket;
    const acls = ["read", "write"];
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>
          Edit{" "}
          <b>
            {bid}/{gid} group
          </b>{" "}
          group permissions
        </h1>
        <GroupTabs
          bid={bid}
          gid={gid}
          capabilities={capabilities}
          selected="permissions">
          <PermissionsForm
            bid={bid}
            groups={groups}
            permissions={permissions}
            acls={acls}
            readonly={this.readonly}
            onSubmit={this.onSubmit}
          />
        </GroupTabs>
      </div>
    );
  }
}
