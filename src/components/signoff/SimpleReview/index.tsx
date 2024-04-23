import { isReviewer } from "../SignoffToolBar";
import { isMember, toReviewEnabled } from "../utils";
import PerRecordDiffView from "./PerRecordDiffView";
import SimpleReviewButtons from "./SimpleReviewButtons";
import SimpleReviewHeader from "./SimpleReviewHeader";
import * as CollectionActions from "@src/actions/collection";
import * as SignoffActions from "@src/actions/signoff";
import Spinner from "@src/components/Spinner";
import CollectionTabs from "@src/components/collection/CollectionTabs";
import { storageKeys, useLocalStorage } from "@src/hooks/storage";
import { canEditCollection } from "@src/permission";
import type {
  Capabilities,
  CollectionRouteMatch,
  CollectionState,
  SessionState,
  SignoffState,
  ValidRecord,
} from "@src/types";
import React, { useEffect, useState } from "react";
import { Shuffle } from "react-bootstrap-icons";
import { Redirect, useHistory } from "react-router-dom";

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
  const history = useHistory();
  const signoffSource = signoff?.collectionsInfo?.source;
  const sourceBid = signoffSource?.bid;
  const sourceCid = signoffSource?.cid;

  const signoffDest = signoff?.collectionsInfo?.destination;
  const destBid = signoffDest?.bid;
  const destCid = signoffDest?.cid;

  const canReview = signoffSource
    ? (isReviewer(signoffSource, session) &&
        session.serverInfo?.user?.id !== signoffSource.lastReviewRequestBy) ||
      !toReviewEnabled(session, signoffSource, signoffDest)
    : false;

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
        try {
          const newRecords = await fetchRecords(sourceBid, sourceCid);
          const oldRecords = await fetchRecords(destBid, destCid);
          setRecords({ oldRecords, newRecords, loading: false });
        } catch (ex) {
          if (ex.data?.code === 401) {
            setRecords({
              ...records,
              loading: false,
            });
          } else {
            console.error(ex);
          }
        }
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

  if (!session.authenticated) {
    return (
      <div className="simple-review-blocked-message list-page">
        Not authenticated
      </div>
    );
  } else if (
    session.authenticating ||
    session.busy ||
    (records.loading && signoffSource && signoffDest)
  ) {
    return <Spinner />;
  }
  const handleRollback = (text: string) => {
    rollbackChanges(text);
    history.push(`/buckets/${bid}/collections/${cid}/records`);
  };

  const SignoffContent = () => {
    if (!signoffSource || !signoffSource?.status) {
      return (
        <div className="alert alert-warning">
          This collection does not support reviews, or you do not have
          permission to review.
        </div>
      );
    }

    return (
      <>
        {signoffSource.status !== "signed" && (
          <SimpleReviewHeader {...signoffSource}>
            <SimpleReviewButtons
              status={signoffSource.status}
              approveChanges={approveChanges}
              declineChanges={declineChanges}
              requestReview={requestReview}
              rollbackChanges={handleRollback}
              canReview={canReview}
              canRequestReview={canRequestReview}
            />
          </SimpleReviewHeader>
        )}
        <PerRecordDiffView
          oldRecords={records.oldRecords}
          newRecords={records.newRecords}
          collectionData={signoffSource}
          displayFields={collection?.data?.displayFields}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setUseSimpleReview(false);
          }}
          style={{
            float: "right",
          }}
        >
          <Shuffle className="icon" /> Switch to Legacy Review UI
        </button>
      </>
    );
  };

  return (
    <div className="list-page">
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
        <SignoffContent />
      </CollectionTabs>
    </div>
  );
}
