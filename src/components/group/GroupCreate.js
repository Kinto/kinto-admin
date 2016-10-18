/* @flow */
import type {
  SessionState,
  BucketState,
  GroupState,
  RouteParams,
} from "../../types";

import React, { Component } from "react";

import GroupForm from "./GroupForm";
import Spinner from "../Spinner";


export default class GroupCreate extends Component {
  props: {
    params: RouteParams,
    session: SessionState,
    bucket: BucketState,
    group: GroupState,
    capabilities: Object,
    createGroup: Function,
  };

  render() {
    const {params, session, bucket, group, createGroup} = this.props;
    const {bid} = params;
    const {busy} = session;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Create a new group in <b>{bid}</b> bucket</h1>
        <div className="panel panel-default">
          <div className="panel-body">
            <GroupForm
              session={session}
              bucket={bucket}
              group={group}
              onSubmit={(formData) => createGroup(bid, formData)} />
          </div>
        </div>
      </div>
    );
  }
}
