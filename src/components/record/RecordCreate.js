/* @flow */
import type {
  SessionState,
  BucketState,
  CollectionState,
  RecordData,
  CollectionRouteMatch,
  Capabilities,
} from "../../types";

import React, { PureComponent } from "react";

import RecordForm from "./RecordForm";

type Props = {
  match: CollectionRouteMatch,
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

export default class RecordCreate extends PureComponent<Props> {
  onSubmit = ({ __attachment__: attachment, ...record }: Object) => {
    const { match, createRecord } = this.props;
    const {
      params: { bid, cid },
    } = match;
    createRecord(bid, cid, record, attachment);
  };

  render() {
    const { match, session, bucket, collection, capabilities } = this.props;
    const {
      params: { bid, cid },
    } = match;
    return (
      <div>
        <h1>
          Add a new record in{" "}
          <b>
            {bid}/{cid}
          </b>
        </h1>
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
