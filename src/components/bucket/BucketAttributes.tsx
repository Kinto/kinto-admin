import React, { useCallback } from "react";
import type {
  Capabilities,
  BucketState,
  BucketData,
  SessionState,
  BucketRouteMatch,
} from "../../types";

import * as BucketActions from "../../actions/bucket";
import Spinner from "../Spinner";
import BucketForm from "./BucketForm";
import BucketTabs from "./BucketTabs";

export type OwnProps = {
  match: BucketRouteMatch;
};

export type StateProps = {
  session: SessionState;
  bucket: BucketState;
  capabilities: Capabilities;
};

export type Props = OwnProps &
  StateProps & {
    updateBucket: typeof BucketActions.updateBucket;
    deleteBucket: typeof BucketActions.deleteBucket;
  };

const BucketAttributes: React.FC<Props> = ({
  match,
  session,
  bucket,
  capabilities,
  updateBucket,
  deleteBucket,
}) => {
  const {
    params: { bid },
  } = match;
  const { busy, data: formData } = bucket;

  const handleDeleteBucket = useCallback(
    (bid: string) => {
      const message = [
        "This will delete the bucket and all the collections and",
        "records it contains. Are you sure?",
      ].join(" ");
      if (confirm(message)) {
        deleteBucket(bid);
      }
    },
    [deleteBucket]
  );

  const handleSubmit = useCallback(
    (formData: BucketData) => {
      updateBucket(bid, { data: formData });
    },
    [bid, updateBucket]
  );

  if (busy) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>
        Edit <b>{bid}</b> bucket attributes
      </h1>
      <BucketTabs bid={bid} capabilities={capabilities} selected="attributes">
        <BucketForm
          session={session}
          bid={bid}
          bucket={bucket}
          formData={formData}
          deleteBucket={handleDeleteBucket}
          onSubmit={handleSubmit}
        />
      </BucketTabs>
    </div>
  );
};

export default BucketAttributes;
