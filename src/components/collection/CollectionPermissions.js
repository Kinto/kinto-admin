/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  CollectionPermissions,
  CollectionRouteParams,
} from "../../types";

import React, { PureComponent } from "react";

import Spinner from "../Spinner";
import CollectionTabs from "./CollectionTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditCollection } from "../../permission";

export default class CollectionPermissions_ extends PureComponent {
  props: {
    session: SessionState,
    bucket: BucketState,
    collection: CollectionState,
    capabilities: Capabilities,
    params: CollectionRouteParams,
    updateCollection: (
      bid: string,
      cid: string,
      data: { permissions: CollectionPermissions }
    ) => void,
  };

  onSubmit = ({ formData }: { formData: CollectionPermissions }) => {
    const { params, updateCollection } = this.props;
    const { bid, cid } = params;
    updateCollection(bid, cid, { permissions: formData });
  };

  get readonly(): boolean {
    const { session, bucket, collection } = this.props;
    return !canEditCollection(session, bucket, collection);
  }

  render() {
    const { params, capabilities, collection, bucket } = this.props;
    const { bid, cid } = params;
    const { busy, permissions } = collection;
    const { groups } = bucket;
    const acls: string[] = ["read", "write", "record:create"];
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Edit <b>{bid}/{cid} collection</b> collection permissions</h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          capabilities={capabilities}
          selected="permissions">
          <PermissionsForm
            bid={bid}
            groups={groups}
            permissions={permissions}
            acls={acls}
            readonly={this.readonly}
            onSubmit={this.onSubmit}
          />
        </CollectionTabs>
      </div>
    );
  }
}
