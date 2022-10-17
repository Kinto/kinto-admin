import React, { useEffect, useState } from "react";
import type {
  SessionState,
  ValidRecord,
  CollectionRouteMatch,
  SignoffState,
} from "../../../types";

import * as SignoffActions from "../../../actions/signoff";
import * as CollectionActions from "../../../actions/collection";
import SimpleReviewButtons from "./SimpleReviewButtons";
import SimpleReviewHeader from "./SimpleReviewHeader";
import PerRecordDiffView from "./PerRecordDiffView";
import { isReviewer } from "../SignoffToolBar";
import Spinner from "../../Spinner";

export type StateProps = {
  signoff?: SignoffState;
  session: SessionState;
  fetchRecords(bid: string, cid: string): Promise<Array<ValidRecord>>;
};

export type SimpleReviewProps = StateProps & {
  approveChanges: typeof SignoffActions.approveChanges;
  declineChanges: typeof SignoffActions.declineChanges;
  rollbackChanges: typeof SignoffActions.rollbackChanges;
  listRecords: typeof CollectionActions.listRecords;
  match: CollectionRouteMatch;
  location: Location;
};

export default function SimpleReview({
  signoff,
  session,
  fetchRecords,
  approveChanges,
  declineChanges,
  rollbackChanges,
  listRecords,
  match,
}: SimpleReviewProps) {
  const signoffSource = signoff?.collectionsInfo?.source;
  const sourceBid = signoffSource?.bid;
  const sourceCid = signoffSource?.cid;

  const signoffDest = signoff?.collectionsInfo?.destination;
  const destBid = signoffDest?.bid;
  const destCid = signoffDest?.cid;

  const canReview = signoffSource ? isReviewer(signoffSource, session) : false;
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
    async function load() {
      const {
        params: { bid, cid },
      } = match;
      if (bid && cid) {
        // For signoff
        listRecords(bid, cid, "id");
      }
    }
    load();
  }, [match.params.bid, match.params.cid]);

  useEffect(() => {
    async function getRecords() {
      if (destCid && destBid && sourceBid && sourceCid) {
        setRecords({ oldRecords: [], newRecords: [], loading: true });
        const newRecords = await fetchRecords(sourceBid, sourceCid);
        const oldRecords = await fetchRecords(destBid, destCid);
        setRecords({ oldRecords, newRecords, loading: false });
      }
    }
    getRecords();
  }, [destBid, destCid, sourceBid, sourceCid]);

  let message = "";
  if (session.authenticating) {
    return <Spinner />;
  } else if (!session.authenticated) {
    message = "Not authenticated";
  } else if (!signoffSource || !signoffSource?.status) {
    message = "This is not a collection that supports reviews.";
  } else if (session.authenticated && !canReview) {
    message = `You do not have review permissions for the ${sourceCid} collection. Please contact an authorized reviewer.`;
  } else if (records.loading) {
    return <Spinner />;
  }

  if (message) {
    return <div className="simple-review-blocked-message p-4">{message}</div>;
  }

  return (
    <div className="p-4">
      {["to-review", "work-in-progress"].includes(signoffSource.status) && (
        <SimpleReviewHeader {...signoffSource}>
          <SimpleReviewButtons
            status={signoffSource.status}
            approveChanges={approveChanges}
            declineChanges={declineChanges}
            rollbackChanges={rollbackChanges}
          />
        </SimpleReviewHeader>
      )}

      <PerRecordDiffView
        oldRecords={records.oldRecords}
        newRecords={records.newRecords}
        collectionData={signoffSource}
      />
    </div>
  );
}
