import React, { Component } from "react";

import Spinner from "../Spinner";
import GroupTabs from "./GroupTabs";
import PermissionsForm from "../PermissionsForm";


export default class GroupPermissions extends Component {
  onSubmit = ({formData}) => {
    const {params, updateGroup} = this.props;
    const {bid, gid} = params;
    updateGroup(bid, gid, {permissions: formData});
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
          gid={gid}
          capabilities={capabilities}
          selected="permissions">
          <PermissionsForm
            permissions={permissions}
            acls={acls}
            onSubmit={this.onSubmit} />
        </GroupTabs>
      </div>
    );
  }
}
