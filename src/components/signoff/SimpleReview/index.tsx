import React, { useEffect, useState } from "react";
import type {
  SessionState,
  ValidRecord,
  CollectionRouteMatch,
  SignoffState,
  CollectionState,
  Capabilities,
} from "../../../types";

import * as SignoffActions from "../../../actions/signoff";
import * as CollectionActions from "../../../actions/collection";
import SimpleReviewButtons from "./SimpleReviewButtons";
import SimpleReviewHeader from "./SimpleReviewHeader";
import PerRecordDiffView from "./PerRecordDiffView";
import { isReviewer } from "../SignoffToolBar";
import Spinner from "../../Spinner";
import CollectionTabs from "../../collection/CollectionTabs";
import { storageKeys, useLocalStorage } from "../../../hooks/storage";
import { Redirect } from "react-router-dom";
import { Shuffle } from "react-bootstrap-icons";
import { canEditCollection } from "../../../permission";
import { isMember } from "../utils";

export type StateProps = {
  signoff?: SignoffState;
  session: SessionState;
  capabilities: Capabilities;
  collection: CollectionState;
  fetchRecords(bid: string, cid: string): Promise<Array<ValidRecord>>;
};

export type SimpleReviewProps = StateProps & {
  approveChanges: typeof SignoffActions.approveChanges;
  declineChanges: typeof SignoffActions.declineChanges;
  requestReview: typeof SignoffActions.requestReview;
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
  requestReview,
  rollbackChanges,
  listRecords,
  match,
  collection,
  capabilities,
}: SimpleReviewProps) {
  const [useSimpleReview, setUseSimpleReview] = useLocalStorage(
    storageKeys.useSimpleReview,
    true
  );
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
    loading: true,
    newRecords: [],
    oldRecords: [],
  });

  const {
    params: { bid, cid },
  } = match;
  const canRequestReview =
    canEditCollection(session, bid, collection) &&
    isMember("editors_group", signoffSource, session);

  useEffect(() => {
    async function load() {
      if (bid && cid) {
        // For signoff
        listRecords(bid, cid, "id");
      }
    }
    load();
  }, [bid, cid]);

  useEffect(() => {
    // get collection data
    async function getRecords() {
      if (destCid && destBid && sourceBid && sourceCid) {
        const newRecords = await fetchRecords(sourceBid, sourceCid);
        const oldRecords = await fetchRecords(destBid, destCid);
        setRecords({ oldRecords, newRecords, loading: false });
      }
    }
    getRecords();
  }, [destBid, destCid, sourceBid, sourceCid]);

  if (!useSimpleReview) {
    return (
      <Redirect
        exact
        from={`/buckets/${bid}/collections/${cid}/simple-review`}
        to={`/buckets/${bid}/collections/${cid}/records`}
      />
    );
  }

  let message = "";
  if (session.authenticating) {
    return <Spinner />;
  } else if (!session.authenticated) {
    message = "Not authenticated";
  } else if (!signoffSource || !signoffSource?.status) {
    // TODO: use this to show/hide
    // also: {["to-review", "work-in-progress"].includes(signoffSource.status) && (
    message = "This is not a collection that supports reviews.";
  }

  if (message) {
    return <div className="simple-review-blocked-message p-4">{message}</div>;
  }

  return (
    <div className="p-4">
      <h1>
        Review{" "}
        <b>
          {bid}/{cid}
        </b>{" "}
        Changes
      </h1>
      <CollectionTabs
        bid={bid}
        cid={cid}
        selected="simple-review"
        capabilities={capabilities || {}}
        totalRecords={collection?.totalRecords || 0}
      >
        {signoffSource.status !== "signed" && (
          <SimpleReviewHeader {...signoffSource}>
            <SimpleReviewButtons
              status={signoffSource.status}
              approveChanges={approveChanges}
              declineChanges={declineChanges}
              requestReview={requestReview}
              rollbackChanges={rollbackChanges}
              canReview={canReview}
              canRequestReview={canRequestReview}
            />
          </SimpleReviewHeader>
        )}
        {(records.loading && <Spinner />) || (
          <PerRecordDiffView
            oldRecords={records.oldRecords}
            newRecords={records.newRecords}
            collectionData={signoffSource}
          />
        )}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setUseSimpleReview(false);
          }}
        >
          <Shuffle className="icon" /> Switch to Legacy Review UI
        </button>
      </CollectionTabs>
    </div>
  );
}
