/* @flow */
import type {
  Capabilities,
  BucketState,
  BucketPermissions,
  SessionState,
  RouteParams,
} from "../../types";

import React, { Component } from "react";

import Spinner from "../Spinner";
import BucketTabs from "./BucketTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditBucket } from "../../permission";


export default class BucketPermissions_ extends Component {
  props: {
    params: RouteParams,
    session: SessionState,
    bucket: BucketState,
    capabilities: Capabilities,
    updateBucket: Function,
  };

  onSubmit = ({formData}: {formData: BucketPermissions}) => {
    const {params, updateBucket} = this.props;
    const {bid} = params;
    updateBucket(bid, {permissions: formData});
  }

  get readonly(): boolean {
    const {session, bucket} = this.props;
    return !canEditBucket(session, bucket);
  }

  render() {
    const {params, capabilities, bucket} = this.props;
    const {bid} = params;
    const {busy, permissions} = bucket;
    const acls = [
      "read",
      "write",
      "collection:create",
      "group:create",
    ];
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Edit <b>{bid}</b> bucket permissions</h1>
        <BucketTabs
          bid={bid}
          capabilities={capabilities}
          selected="permissions">
          <PermissionsForm
            permissions={permissions}
            acls={acls}
            readonly={this.readonly}
            onSubmit={this.onSubmit} />
        </BucketTabs>
      </div>
    );
  }
}
