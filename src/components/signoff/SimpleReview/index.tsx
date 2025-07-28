import { isReviewer } from "../SignoffToolBar";
import { isMember, toReviewEnabled } from "../utils";
import PerRecordDiffView from "./PerRecordDiffView";
import SimpleReviewButtons from "./SimpleReviewButtons";
import SimpleReviewHeader from "./SimpleReviewHeader";
import { getClient } from "@src/client";
import Spinner from "@src/components/Spinner";
import CollectionTabs from "@src/components/collection/CollectionTabs";
import { useCollection } from "@src/hooks/collection";
import { useSimpleReview } from "@src/hooks/preferences";
import { useRecordList } from "@src/hooks/record";
import { useAuth, usePermissions, useServerInfo } from "@src/hooks/session";
import { useSignoff } from "@src/hooks/signoff";
import { canEditCollection } from "@src/permission";
import React from "react";
import { Shuffle } from "react-bootstrap-icons";
import { Navigate, useNavigate, useParams } from "react-router";

export default function SimpleReview() {
  const { bid, cid } = useParams();
  const collection = useCollection(bid, cid);
  const [simpleReview, setSimpleReview] = useSimpleReview();
  const serverInfo = useServerInfo();
  const auth = useAuth();
  const permissions = usePermissions();

  const signoff = useSignoff(bid, cid, serverInfo?.capabilities?.signer);
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
    ? (isReviewer(signoffSource, serverInfo) &&
        serverInfo?.user?.id !== signoffSource.lastReviewRequestBy) ||
      !toReviewEnabled(serverInfo, signoffSource, signoffDest)
    : false;

  const canRequestReview =
    canEditCollection(permissions, bid, cid) &&
    isMember("editors_group", signoffSource, serverInfo);

  if (!simpleReview) {
    return <Navigate to={`/buckets/${bid}/collections/${cid}/records`} />;
  }

  if (!auth) {
    return (
      <div className="simple-review-blocked-message list-page">
        Not authenticated
      </div>
    );
  } else if (
    signoff?.source &&
    !signoff.source.status &&
    !newRecords?.data &&
    !oldRecords?.data
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
            setSimpleReview(false);
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
