import React, { Component } from "react";

import Spinner from "../Spinner";
import CollectionTabs from "./CollectionTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditCollection } from "../../permission";


export default class CollectionPermissions extends Component {
  onSubmit = ({formData}) => {
    const {params, updateCollection} = this.props;
    const {bid, cid} = params;
    updateCollection(bid, cid, {permissions: formData});
  }

  get readonly() {
    const {session, bucket, collection} = this.props;
    return !canEditCollection(session, bucket, collection);
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
          cid={cid}
          capabilities={capabilities}
          selected="permissions">
          <PermissionsForm
            permissions={permissions}
            acls={acls}
            readonly={this.readonly}
            onSubmit={this.onSubmit} />
        </CollectionTabs>
      </div>
    );
  }
}
