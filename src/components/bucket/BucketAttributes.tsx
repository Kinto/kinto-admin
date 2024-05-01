import BucketForm from "./BucketForm";
import BucketTabs from "./BucketTabs";
import * as BucketActions from "@src/actions/bucket";
import Spinner from "@src/components/Spinner";
import type {
  BucketData,
  BucketRouteMatch,
  BucketState,
  Capabilities,
  SessionState,
} from "@src/types";
import React, { useCallback } from "react";

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

export default function BucketAttributes({
  match,
  session,
  bucket,
  capabilities,
  updateBucket,
  deleteBucket,
}: Props) {
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

  return (
    <div>
      <h1>
        Edit <b>{bid}</b> bucket attributes
      </h1>
      <BucketTabs bid={bid} capabilities={capabilities} selected="attributes">
        {busy ? (
          <Spinner />
        ) : (
          <BucketForm
            session={session}
            bid={bid}
            bucket={bucket}
            formData={formData}
            deleteBucket={handleDeleteBucket}
            onSubmit={handleSubmit}
          />
        )}
      </BucketTabs>
    </div>
  );
}
