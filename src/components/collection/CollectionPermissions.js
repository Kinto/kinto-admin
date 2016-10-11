import React, { Component } from "react";

import Spinner from "../Spinner";
import CollectionTabs from "./CollectionTabs";
import PermissionsForm from "../PermissionsForm";


export default class CollectionPermissions extends Component {
  onSubmit = ({formData}) => {
    const {params, updateCollection} = this.props;
    const {bid, cid} = params;
    updateCollection(bid, cid, {permissions: formData});
  }

  render() {
    const {params, capabilities, collection} = this.props;
    const {bid, cid} = params;
    const {busy, permissions} = collection;
    const acls = [
      "read",
      "write",
      "record:create",
    ];
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Permissions for <b>{bid}/{cid} collection</b></h1>
        <CollectionTabs
          bid={bid}
          capabilities={capabilities}
          selected="permissions">
          <PermissionsForm
            permissions={permissions}
            acls={acls}
            onSubmit={this.onSubmit} />
        </CollectionTabs>
      </div>
    );
  }
}
