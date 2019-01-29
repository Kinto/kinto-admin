/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  CollectionPermissions,
  CollectionRouteMatch,
} from "../../types";

import React, { PureComponent } from "react";

import * as BucketActions from "../../actions/bucket";
import Spinner from "../Spinner";
import CollectionTabs from "./CollectionTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditCollection } from "../../permission";

export type OwnProps = {|
  match: CollectionRouteMatch,
|};

export type StateProps = {|
  session: SessionState,
  bucket: BucketState,
  collection: CollectionState,
  capabilities: Capabilities,
|};

export type Props = {
  ...OwnProps,
  ...StateProps,
  updateCollection: typeof BucketActions.updateCollection,
};

export default class CollectionPermissions_ extends PureComponent<Props> {
  onSubmit = ({ formData }: { formData: CollectionPermissions }) => {
    const { match, updateCollection } = this.props;
    const {
      params: { bid, cid },
    } = match;
    updateCollection(bid, cid, { permissions: formData });
  };

  get readonly(): boolean {
    const { session, bucket, collection } = this.props;
    return !canEditCollection(session, bucket, collection);
  }

  render() {
    const { match, capabilities, collection, bucket } = this.props;
    const {
      params: { bid, cid },
    } = match;
    const { busy, permissions } = collection;
    const { groups } = bucket;
    const acls: string[] = ["read", "write", "record:create"];
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>
          Edit{" "}
          <b>
            {bid}/{cid} collection
          </b>{" "}
          collection permissions
        </h1>
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
