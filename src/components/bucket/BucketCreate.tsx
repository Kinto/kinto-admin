import * as BucketActions from "../../actions/bucket";
import type { BucketState, SessionState } from "../../types";
import Spinner from "../Spinner";
import BucketForm from "./BucketForm";
import React from "react";

export type StateProps = {
  session: SessionState;
  bucket: BucketState;
};

export type Props = StateProps & {
  createBucket: typeof BucketActions.createBucket;
};

export default function BucketCreate({ session, bucket, createBucket }) {
  const { busy } = session;

  if (busy) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>Create a new bucket</h1>
      <div className="card">
        <div className="card-body">
          <BucketForm
            session={session}
            bucket={bucket}
            onSubmit={({ id, ...attributes }) => createBucket(id, attributes)}
          />
        </div>
      </div>
    </div>
  );
}
