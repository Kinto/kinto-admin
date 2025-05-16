import { isReviewer } from "../SignoffToolBar";
import { isMember, toReviewEnabled } from "../utils";
import PerRecordDiffView from "./PerRecordDiffView";
import SimpleReviewButtons from "./SimpleReviewButtons";
import SimpleReviewHeader from "./SimpleReviewHeader";
import { getClient } from "@src/client";
import Spinner from "@src/components/Spinner";
import CollectionTabs from "@src/components/collection/CollectionTabs";
import { useAppSelector } from "@src/hooks/app";
import { useCollection } from "@src/hooks/collection";
import { useRecordList } from "@src/hooks/record";
import { useSignoff } from "@src/hooks/signoff";
import { storageKeys, useLocalStorage } from "@src/hooks/storage";
import { canEditCollection } from "@src/permission";
import React from "react";
import { Shuffle } from "react-bootstrap-icons";
import { Navigate, useNavigate, useParams } from "react-router";

export default function SimpleReview() {
  const { bid, cid } = useParams();
  const collection = useCollection(bid, cid);
  const [useSimpleReview, setUseSimpleReview] = useLocalStorage(
    storageKeys.useSimpleReview,
    true
  );
  const session = useAppSelector(state => state.session);
  const signoff = useSignoff(bid, cid, session.serverInfo.capabilities.signer);
  const navigate = useNavigate();
  const signoffSource = signoff?.source;
  const sourceBid = signoffSource?.bucket;
  const sourceCid = signoffSource?.collection;

  const signoffDest = signoff?.destination;
  const destBid = signoffDest?.bucket;
  const destCid = signoffDest?.collection;

  const newRecords = useRecordList(sourceBid, sourceCid, "id", true);
  const oldRecords = useRecordList(destBid, destCid, "id", true);

  const canReview = signoffSource
    ? (isReviewer(signoffSource, session) &&
        session.serverInfo?.user?.id !== signoffSource.lastReviewRequestBy) ||
      !toReviewEnabled(session, signoffSource, signoffDest)
    : false;

  const canRequestReview =
    canEditCollection(session, bid, cid) &&
    isMember("editors_group", signoffSource, session);

  if (!useSimpleReview) {
    return <Navigate to={`/buckets/${bid}/collections/${cid}/records`} />;
  }

  if (!session.authenticated && !session.authenticating) {
    return (
      <div className="simple-review-blocked-message list-page">
        Not authenticated
      </div>
    );
  } else if (
    session.authenticating ||
    session.busy ||
    (signoff?.source &&
      !signoff.source.status &&
      !newRecords?.data &&
      !oldRecords?.data)
  ) {
    return <Spinner />;
  }

  const reviewAction = async patchedFields => {
    await getClient()
      .bucket(sourceBid)
      .collection(sourceCid)
      .setData(patchedFields, {
        safe: true,
        patch: true,
        last_modified: collection.last_modified,
      });
    navigate(`/buckets/${bid}/collections/${cid}/records`);
  };

  const rollbackChanges = async (text: string) => {
    await reviewAction({
      status: "to-rollback",
      last_editor_comment: text,
    });
  };

  const approveChanges = async () => {
    await reviewAction({
      status: "to-sign",
      last_reviewer_comment: "",
    });
  };

  const declineChanges = async (text: string) => {
    await reviewAction({
      status: "work-in-progress",
      last_reviewer_comment: text,
    });
  };

  const requestReview = async (text: string) => {
    await reviewAction({
      status: "to-review",
      last_editor_comment: text,
    });
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
              rollbackChanges={rollbackChanges}
              canReview={canReview}
              canRequestReview={canRequestReview}
            />
          </SimpleReviewHeader>
        )}
        <PerRecordDiffView
          oldRecords={oldRecords.data || []}
          newRecords={newRecords.data || []}
          collectionData={signoffSource}
          displayFields={collection?.displayFields}
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
        totalRecords={collection?.totalRecords || 0}
      >
        {!oldRecords.data || !newRecords.data ? (
          <Spinner />
        ) : (
          <SignoffContent />
        )}
      </CollectionTabs>
    </div>
  );
}
