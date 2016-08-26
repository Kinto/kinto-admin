import React, { Component } from "react";

import GroupForm from "./GroupForm";
import GroupTabs from "./GroupTabs";
import Spinner from "./Spinner";


export default class GroupEdit extends Component {
  onSubmit = (formData) => {
    const {params, updateGroup} = this.props;
    const {bid, gid} = params;
    updateGroup(bid, gid, formData);
  };

  deleteGroup = (gid) => {
    const {deleteGroup, params} = this.props;
    const {bid} = params;
    if (confirm("This will delete the group. Are you sure?")) {
      deleteGroup(bid, gid);
    }
  };

  render() {
    const {params, session, bucket, group, capabilities} = this.props;
    const {bid, gid} = params;
    const {busy, members, data} = group;

    if (busy) {
      return <Spinner />;
    }

    const formData = {
      name: gid,
      members,
      // Stringify JSON fields so they're editable in a text field
      data: JSON.stringify(data || {}, null, 2),
    };

    return (
      <div>
        <h1>Edit <b>{bid}/{gid}</b> group properties</h1>
        <GroupTabs
          bid={bid}
          gid={gid}
          selected="settings"
          capabilities={capabilities}>
          <GroupForm
            bid={bid}
            gid={gid}
            session={session}
            bucket={bucket}
            group={group}
            deleteGroup={this.deleteGroup}
            formData={formData}
            onSubmit={this.onSubmit} />
        </GroupTabs>
      </div>
    );
  }
}
