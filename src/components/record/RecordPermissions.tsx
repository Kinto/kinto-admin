import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  RecordState,
  RecordRouteMatch,
} from "../../types";

import React, { PureComponent } from "react";

import * as CollectionActions from "../../actions/collection";
import Spinner from "../Spinner";
import RecordTabs from "./RecordTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditRecord } from "../../permission";

export type OwnProps = {
  match: RecordRouteMatch;
};

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
  bucket: BucketState;
  collection: CollectionState;
  record: RecordState;
};

export type Props = OwnProps &
  StateProps & {
    updateRecord: typeof CollectionActions.updateRecord;
  };

export default class RecordPermissions_ extends PureComponent<Props> {
  onSubmit = ({ formData }: { formData: any }) => {
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
          selected="permissions"
        >
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
