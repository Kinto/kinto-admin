import React, { useCallback } from "react";

import type {
  SessionState,
  BucketState,
  CollectionState,
  CollectionRouteMatch,
  Capabilities,
} from "../../types";

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

export default function RecordCreate({
  match,
  session,
  capabilities,
  bucket,
  collection,
  createRecord,
}: Props) {
  const onSubmit = useCallback(
    ({ __attachment__: attachment, ...record }) => {
      const {
        params: { bid, cid },
      } = match;
      createRecord(bid, cid, record, attachment);
    },
    [match, createRecord]
  );

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
            onSubmit={onSubmit}
            capabilities={capabilities}
          />
        </div>
      </div>
    </div>
  );
}
