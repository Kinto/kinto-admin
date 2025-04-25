import { isReviewer } from "../SignoffToolBar";
import { isMember, toReviewEnabled } from "../utils";
import PerRecordDiffView from "./PerRecordDiffView";
import SimpleReviewButtons from "./SimpleReviewButtons";
import SimpleReviewHeader from "./SimpleReviewHeader";
import * as CollectionActions from "@src/actions/collection";
import * as SignoffActions from "@src/actions/signoff";
import Spinner from "@src/components/Spinner";
import CollectionTabs from "@src/components/collection/CollectionTabs";
import { useCollection } from "@src/hooks/collection";
import { useSignoff } from "@src/hooks/signoff";
import { storageKeys, useLocalStorage } from "@src/hooks/storage";
import { canEditCollection } from "@src/permission";
import type {
  Capabilities,
  CollectionState,
  SessionState,
  SignoffState,
  ValidRecord,
} from "@src/types";
import React, { useEffect, useState } from "react";
import { Shuffle } from "react-bootstrap-icons";
import { Navigate, useNavigate, useParams } from "react-router";

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
};

export default function SimpleReview({
  session,
  fetchRecords,
  approveChanges,
  declineChanges,
  requestReview,
  rollbackChanges,
  listRecords,
  capabilities,
}: SimpleReviewProps) {
  const { bid, cid } = useParams();
  const collection = useCollection(bid, cid);
  const [useSimpleReview, setUseSimpleReview] = useLocalStorage(
    storageKeys.useSimpleReview,
    true
  );
  const signoff = useSignoff(
    bid,
    cid,
    collection,
    session.serverInfo.capabilities.signer
  );
  const navigate = useNavigate();
  const signoffSource = signoff?.source;
  const sourceBid = signoffSource?.bucket;
  const sourceCid = signoffSource?.collection;

  const signoffDest = signoff?.destination;
  const destBid = signoffDest?.bucket;
  const destCid = signoffDest?.collection;

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

  const canRequestReview =
    canEditCollection(session, bid, cid) &&
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
      } else {
        setRecords({ oldRecords: [], newRecords: [], loading: false });
      }
    }
    getRecords();
  }, [destBid, destCid, sourceBid, sourceCid]);

  if (!useSimpleReview) {
    return <Navigate to={`/buckets/${bid}/collections/${cid}/records`} />;
  }

  if (!session.authenticated) {
    return (
      <div className="simple-review-blocked-message list-page">
        Not authenticated
      </div>
    );
  } else if (session.authenticating || session.busy) {
    return <Spinner />;
  }
  const handleRollback = (text: string) => {
    rollbackChanges(text);
    navigate(`/buckets/${bid}/collections/${cid}/records`);
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
        {records.loading ? <Spinner /> : <SignoffContent />}
      </CollectionTabs>
    </div>
  );
}
