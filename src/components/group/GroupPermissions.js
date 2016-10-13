import React, { Component } from "react";

import Spinner from "../Spinner";
import GroupTabs from "./GroupTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditGroup } from "../../permission";


export default class GroupPermissions extends Component {
  onSubmit = ({formData}) => {
    const {params, updateGroup} = this.props;
    const {bid, gid} = params;
    updateGroup(bid, gid, {permissions: formData});
  }

  get readonly() {
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
        <h1>Permissions for <b>{bid}/{gid} group</b></h1>
        <GroupTabs
          bid={bid}
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
