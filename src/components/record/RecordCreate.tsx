import type {
  SessionState,
  BucketState,
  CollectionState,
  CollectionRouteMatch,
  Capabilities,
} from "../../types";

import React, { PureComponent } from "react";

import * as CollectionActions from "../../actions/collection";
import RecordForm from "./RecordForm";

export type OwnProps = {
  match: CollectionRouteMatch;
};

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
  bucket: BucketState;
  collection: CollectionState;
};

export type Props = OwnProps &
  StateProps & {
    createRecord: typeof CollectionActions.createRecord;
  };

export default class RecordCreate extends PureComponent<Props> {
  onSubmit = ({ __attachment__: attachment, ...record }: any) => {
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
        <div className="card">
          <div className="card-body">
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
