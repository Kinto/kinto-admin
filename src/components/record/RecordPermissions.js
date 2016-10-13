import React, { Component } from "react";

import Spinner from "../Spinner";
import RecordTabs from "./RecordTabs";
import PermissionsForm from "../PermissionsForm";


export default class RecordPermissions extends Component {
  onSubmit = ({formData}) => {
    const {params, updateRecord} = this.props;
    const {bid, cid, rid} = params;
    updateRecord(bid, cid, rid, {permissions: formData});
  }

  render() {
    const {params, capabilities, record} = this.props;
    const {bid, cid, rid} = params;
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
            permissions={permissions}
            acls={acls}
            onSubmit={this.onSubmit} />
        </RecordTabs>
      </div>
    );
  }
}
