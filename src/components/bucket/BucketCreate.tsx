import React from "react";
import type { SessionState, BucketState } from "../../types";

import * as BucketActions from "../../actions/bucket";
import BucketForm from "./BucketForm";
import Spinner from "../Spinner";

export type StateProps = {
  session: SessionState;
  bucket: BucketState;
};

export type Props = StateProps & {
  createBucket: typeof BucketActions.createBucket;
};

const BucketCreate: React.FC<Props> = ({ session, bucket, createBucket }) => {
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
};

export default BucketCreate;
