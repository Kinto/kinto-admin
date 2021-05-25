import React, { useEffect, useState } from "react";
import type {
  SessionState,
  BucketState,
  CollectionState,
  ValidRecord,
} from "../../types";

import * as SignoffActions from "../../plugins/signoff/actions";
import SimpleReviewButtons from "./SimpleReviewButtons";
import SimpleReviewHeader from "./SimpleReviewHeader";
import PerRecordDiffView from "./PerRecordDiffView";

export type StateProps = {
  session: SessionState;
  bucket: BucketState;
  collection: CollectionState;
  fetchRecords(bid: string, cid: string): Promise<Array<ValidRecord>>;
};

export type SimpleReviewProps = StateProps & {
  approveChanges: typeof SignoffActions.approveChanges;
  declineChanges: typeof SignoffActions.declineChanges;
  rollbackChanges: typeof SignoffActions.rollbackChanges;
};

export default function SimpleReview({
  bucket,
  collection,
  session,
  fetchRecords,
  approveChanges,
  declineChanges,
  rollbackChanges,
}: SimpleReviewProps) {
  const bid = bucket.data.id;
  const cid = collection.data.id;
  const isReviewer = session.serverInfo.user?.principals?.includes(
    `/buckets/${bid}/groups/${cid}-reviewers`
  );
  const isReviewableBucket = bid?.match("-workspace");

  const [records, setRecords] = useState<{
    loading: boolean;
    newRecords: ValidRecord[];
    oldRecords: ValidRecord[];
  }>({
    loading: false,
    newRecords: [],
    oldRecords: [],
  });

  useEffect(() => {
    async function getRecords() {
      if (isReviewableBucket && isReviewer && bid && cid) {
        setRecords({ newRecords: [], oldRecords: [], loading: true });
        const oldRecords = await fetchRecords(
          bid.replace("-workspace", ""),
          cid
        );
        const newRecords = await fetchRecords(bid, cid);
        setRecords({ oldRecords, newRecords, loading: false });
      }
    }
    getRecords();
  }, [bid, cid]);

  let message = "";
  if (session.authenticating) {
    message = "Loading...";
  } else if (!session.authenticated) {
    message = "Not authenticated";
  } else if (!isReviewableBucket || !collection.data.status) {
    message = "This is not a collection that supports reviews.";
  } else if (session.authenticated && !isReviewer) {
    message = `You do not have review permissions for the ${collection.data.id} collection. Please contact an authorized reviewer.`;
  } else if (records.loading) {
    message = "Loading...";
  }

  if (message) {
    return <div className="simple-review-blocked-message p-4">{message}</div>;
  }

  return (
    <div className="p-4">
      {["to-review", "work-in-progress"].includes(collection.data.status) && (
        <SimpleReviewHeader {...collection.data}>
          <SimpleReviewButtons
            status={collection.data.status}
            approveChanges={approveChanges}
            declineChanges={declineChanges}
            rollbackChanges={rollbackChanges}
          />
        </SimpleReviewHeader>
      )}

      <PerRecordDiffView
        oldRecords={records.oldRecords}
        newRecords={records.newRecords}
        collectionData={collection.data}
      />
    </div>
  );
}
