/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  RecordState,
  RecordRouteMatch,
  RecordPermissions,
} from "../../types";

import React, { PureComponent } from "react";

import Spinner from "../Spinner";
import RecordTabs from "./RecordTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditRecord } from "../../permission";

type Props = {
  match: RecordRouteMatch,
  session: SessionState,
  capabilities: Capabilities,
  bucket: BucketState,
  collection: CollectionState,
  record: RecordState,
  updateRecord: (
    bid: string,
    cid: string,
    rid: string,
    data: { permissions: RecordPermissions }
  ) => void,
};

export default class RecordPermissions_ extends PureComponent<Props> {
  onSubmit = ({ formData }: { formData: Object }) => {
    const { match, updateRecord } = this.props;
    const {
      params: { bid, cid, rid },
    } = match;
    updateRecord(bid, cid, rid, { permissions: formData });
  };

  get readonly(): boolean {
    const { session, bucket, collection, record } = this.props;
    return !canEditRecord(session, bucket, collection, record);
  }

  render() {
    const { match, capabilities, bucket, record } = this.props;
    const {
      params: { bid, cid, rid },
    } = match;
    const { groups } = bucket;
    const { busy, permissions } = record;
    const acls = ["read", "write"];
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>
          Edit{" "}
          <b>
            {bid}/{cid}/{rid}
          </b>{" "}
          record permissions
        </h1>
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
            onSubmit={this.onSubmit}
          />
        </RecordTabs>
      </div>
    );
  }
}
