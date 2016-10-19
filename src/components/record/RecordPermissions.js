/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  RecordState,
  RouteParams,
  RecordPermissions,
} from "../../types";

import React, { Component } from "react";

import Spinner from "../Spinner";
import RecordTabs from "./RecordTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditRecord } from "../../permission";


export default class RecordPermissions_ extends Component {
  props: {
    params: RouteParams,
    session: SessionState,
    capabilities: Capabilities,
    bucket: BucketState,
    collection: CollectionState,
    record: RecordState,
    updateRecord: (
      bid: ?string,
      cid: ?string,
      rid: ?string,
      data: {permissions: RecordPermissions}
    ) => void,
  };

  onSubmit = ({formData}: {formData: Object}) => {
    const {params, updateRecord} = this.props;
    const {bid, cid, rid} = params;
    updateRecord(bid, cid, rid, {permissions: formData});
  }

  get readonly(): boolean {
    const {session, bucket, collection, record} = this.props;
    return !canEditRecord(session, bucket, collection, record);
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
            readonly={this.readonly}
            onSubmit={this.onSubmit} />
        </RecordTabs>
      </div>
    );
  }
}
