/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  GroupState,
  GroupData,
  GroupRouteMatch,
} from "../../types";

import React, { PureComponent } from "react";

import Spinner from "../Spinner";
import GroupForm from "./GroupForm";
import GroupTabs from "./GroupTabs";

type Props = {
  match: GroupRouteMatch,
  session: SessionState,
  bucket: BucketState,
  group: GroupState,
  capabilities: Capabilities,
  updateGroup: (bid: string, gid: string, payload: { data: GroupData }) => void,
  deleteGroup: (bid: string, gid: string) => void,
};

export default class GroupAttributes extends PureComponent<Props> {
  onSubmit = (formData: GroupData) => {
    const { match, updateGroup } = this.props;
    const {
      params: { bid, gid },
    } = match;
    updateGroup(bid, gid, { data: formData });
  };

  deleteGroup = (gid: string) => {
    const { deleteGroup, match } = this.props;
    const {
      params: { bid },
    } = match;
    if (confirm("This will delete the group. Are you sure?")) {
      deleteGroup(bid, gid);
    }
  };

  render() {
    const { match, session, bucket, group, capabilities } = this.props;
    const {
      params: { bid, gid },
    } = match;
    const { busy, data: formData } = group;
    if (busy || formData == null) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>
          Edit{" "}
          <b>
            {bid}/{gid}
          </b>{" "}
          group attributes
        </h1>
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
            onSubmit={this.onSubmit}
          />
        </GroupTabs>
      </div>
    );
  }
}
