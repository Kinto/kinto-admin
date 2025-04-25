import RecordForm from "./RecordForm";
import * as CollectionActions from "@src/actions/collection";
import type {
  BucketState,
  Capabilities,
  CollectionState,
  SessionState,
} from "@src/types";
import React, { useCallback } from "react";
import { useParams } from "react-router";

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
  bucket: BucketState;
  collection: CollectionState;
};

export type Props = StateProps & {
  createRecord: typeof CollectionActions.createRecord;
};

export default function RecordCreate({
  session,
  capabilities,
  createRecord,
}: Props) {
  const { bid, cid } = useParams();
  const onSubmit = useCallback(
    ({ __attachment__: attachment, ...record }) => {
      createRecord(bid, cid, record, attachment);
    },
    [bid, cid, createRecord]
  );

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
            session={session}
            onSubmit={onSubmit}
            capabilities={capabilities}
          />
        </div>
      </div>
    </div>
  );
}
