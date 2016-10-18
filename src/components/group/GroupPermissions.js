/* @flow */
import type {
  SessionState,
  BucketState,
  GroupState,
  RouteParams,
  GroupPermissions,
} from "../../types";

import React, { Component } from "react";

import Spinner from "../Spinner";
import GroupTabs from "./GroupTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditGroup } from "../../permission";


export default class GroupPermissions_ extends Component {
  props: {
    params: RouteParams,
    session: SessionState,
    bucket: BucketState,
    group: GroupState,
    capabilities: Object,
    updateGroup: Function,
    deleteGroup: Function,
  };

  onSubmit = ({formData}: {formData: GroupPermissions}) => {
    const {params, updateGroup} = this.props;
    const {bid, gid} = params;
    updateGroup(bid, gid, {permissions: formData});
  }

  get readonly(): boolean {
    const {session, bucket, group} = this.props;
    return !canEditGroup(session, bucket, group);
  }

  render() {
    const {params, capabilities, group} = this.props;
    const {bid, gid} = params;
    const {busy, permissions} = group;
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
            permissions={permissions}
            acls={acls}
            readonly={this.readonly}
            onSubmit={this.onSubmit} />
        </GroupTabs>
      </div>
    );
  }
}
