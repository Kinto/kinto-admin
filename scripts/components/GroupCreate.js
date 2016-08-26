import React, { Component } from "react";

import GroupForm from "./GroupForm";
import Spinner from "./Spinner";


export default class GroupCreate extends Component {
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
