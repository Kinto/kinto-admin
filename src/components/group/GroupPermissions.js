/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  GroupState,
  GroupRouteParams,
  GroupPermissions,
} from "../../types";

import React, { PureComponent } from "react";

import Spinner from "../Spinner";
import GroupTabs from "./GroupTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditGroup } from "../../permission";

export default class GroupPermissions_ extends PureComponent {
  props: {
    params: GroupRouteParams,
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

  onSubmit = ({ formData }: { formData: GroupPermissions }) => {
    const { params, updateGroup } = this.props;
    const { bid, gid } = params;
    updateGroup(bid, gid, { permissions: formData });
  };

  get readonly(): boolean {
    const { session, bucket, group } = this.props;
    return !canEditGroup(session, bucket, group);
  }

  render() {
    const { params, capabilities, bucket, group } = this.props;
    const { bid, gid } = params;
    const { busy, permissions } = group;
    const { groups } = bucket;
    const acls = ["read", "write"];
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Edit <b>{bid}/{gid} group</b> group permissions</h1>
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
