/* @flow */
import type {
  SessionState,
  BucketState,
  GroupState,
  GroupData,
  RouteParams,
} from "../../types";

import React, { Component } from "react";

import Spinner from "../Spinner";
import GroupForm from "./GroupForm";
import GroupTabs from "./GroupTabs";


export default class GroupAttributes extends Component {
  props: {
    params: RouteParams,
    session: SessionState,
    bucket: BucketState,
    group: GroupState,
    capabilities: Object,
    updateGroup: Function,
    deleteGroup: Function,
  };

  onSubmit = (formData: GroupData) => {
    const {params, updateGroup} = this.props;
    const {bid, gid} = params;
    updateGroup(bid, gid, {data: formData});
  };

  deleteGroup = (gid: string) => {
    const {deleteGroup, params} = this.props;
    const {bid} = params;
    if (confirm("This will delete the group. Are you sure?")) {
      deleteGroup(bid, gid);
    }
  };

  render() {
    const {params, session, bucket, group, capabilities} = this.props;
    const {bid, gid} = params;
    const {busy, data: formData} = group;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Edit <b>{bid}/{gid}</b> group attributes</h1>
        <GroupTabs
          bid={bid}
          gid={gid}
          selected="attributes"
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
