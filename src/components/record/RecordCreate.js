/* @flow */
import type {
  SessionState,
  BucketState,
  CollectionState,
  RecordData,
  CollectionRouteParams,
  Capabilities,
} from "../../types";

import React, { PureComponent } from "react";

import RecordForm from "./RecordForm";

export default class RecordCreate extends PureComponent {
  props: {
    params: CollectionRouteParams,
    session: SessionState,
    capabilities: Capabilities,
    bucket: BucketState,
    collection: CollectionState,
    createRecord: (
      bid: string,
      cid: string,
      record: RecordData,
      attachment: ?string
    ) => void,
  };

  onSubmit = ({ __attachment__: attachment, ...record }: Object) => {
    const { params, createRecord } = this.props;
    const { bid, cid } = params;
    createRecord(bid, cid, record, attachment);
  };

  render() {
    const { params, session, bucket, collection, capabilities } = this.props;
    const { bid, cid } = params;
    return (
      <div>
        <h1>Add a new record in <b>{bid}/{cid}</b></h1>
        <div className="panel panel-default">
          <div className="panel-body">
            <RecordForm
              bid={bid}
              cid={cid}
              session={session}
              bucket={bucket}
              collection={collection}
              onSubmit={this.onSubmit}
              capabilities={capabilities}
            />
          </div>
        </div>
      </div>
    );
  }
}
