import BucketForm from "./BucketForm";
import BucketTabs from "./BucketTabs";
import * as BucketActions from "@src/actions/bucket";
import Spinner from "@src/components/Spinner";
import { useBucket } from "@src/hooks/bucket";
import type {
  BucketData,
  BucketRouteMatch,
  BucketState,
  Capabilities,
  SessionState,
} from "@src/types";
import React, { useCallback } from "react";
import { useParams } from "react-router";

export type OwnProps = {
  match: BucketRouteMatch;
};

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
};

export type Props = OwnProps &
  StateProps & {
    updateBucket: typeof BucketActions.updateBucket;
    deleteBucket: typeof BucketActions.deleteBucket;
  };

export default function BucketAttributes({
  session,
  capabilities,
  updateBucket,
  deleteBucket,
}: Props) {
  const { bid } = useParams();

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
        <BucketForm
          session={session}
          bid={bid}
          deleteBucket={handleDeleteBucket}
          onSubmit={handleSubmit}
        />
      </BucketTabs>
    </div>
  );
}
