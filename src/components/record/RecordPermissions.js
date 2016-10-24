import React, { Component } from "react";

import Spinner from "../Spinner";
import RecordTabs from "./RecordTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditRecord } from "../../permission";


export default class RecordPermissions extends Component {
  onSubmit = ({formData}) => {
    const {params, updateRecord} = this.props;
    const {bid, cid, rid} = params;
    updateRecord(bid, cid, rid, {permissions: formData});
  }

  get readonly() {
    const {session, bucket, collection, record} = this.props;
    return !canEditRecord(session, bucket, collection, record);
  }

  render() {
    const {params, capabilities, bucket, record} = this.props;
    const {bid, cid, rid} = params;
    const {groups} = bucket;
    const {busy, permissions} = record;
    const acls = ["read", "write"];
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Edit <b>{bid}/{cid}/{rid}</b> record permissions</h1>
        <RecordTabs
          bid={bid}
          cid={cid}
          rid={rid}
          capabilities={capabilities}
          selected="permissions">
          <PermissionsForm
            bid={bid}
            groups={groups}
            permissions={permissions}
            acls={acls}
            readonly={this.readonly}
            onSubmit={this.onSubmit} />
        </RecordTabs>
      </div>
    );
  }
}
