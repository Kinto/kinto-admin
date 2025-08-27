import { isReviewer } from "../SignoffToolBar";
import { isMember, toReviewEnabled } from "../utils";
import PerRecordDiffView from "./PerRecordDiffView";
import SimpleReviewButtons from "./SimpleReviewButtons";
import SimpleReviewHeader from "./SimpleReviewHeader";
import { getClient } from "@src/client";
import Spinner from "@src/components/Spinner";
import CollectionTabs from "@src/components/collection/CollectionTabs";
import { useCollection } from "@src/hooks/collection";
import { useRecordList } from "@src/hooks/record";
import { useAuth, usePermissions, useServerInfo } from "@src/hooks/session";
import { useSignoff } from "@src/hooks/signoff";
import { canEditCollection } from "@src/permission";
import type { RecordData, SignoffSourceInfo } from "@src/types";
import React from "react";
import { useNavigate, useParams } from "react-router";

interface SignedCollectionRecordDiffViewProps {
  collectionData: SignoffSourceInfo;
  oldRecords: RecordData[];
  newRecords: RecordData[];
  displayFields: string[];
}

function SignedCollectionRecordDiffView({
  collectionData,
  oldRecords,
  newRecords,
  displayFields,
}: SignedCollectionRecordDiffViewProps) {
  const status = collectionData?.status;
  if (["to-review", "work-in-progress"].includes(status)) {
    return (
      <PerRecordDiffView
        oldRecords={oldRecords}
        newRecords={newRecords}
        displayFields={displayFields}
      />
    );
  }
  return (
    <div>
      No changes to review, collection status is{" "}
      <code>{collectionData.status}</code>.
    </div>
  );
}

export default function SimpleReview() {
  const { bid, cid } = useParams();
  const collection = useCollection(bid, cid);
  const serverInfo = useServerInfo();
  const auth = useAuth();
  const permissions = usePermissions();

  const signoff = useSignoff(bid, cid, serverInfo?.capabilities?.signer);
  const navigate = useNavigate();
  const sourceBid = signoff?.source?.bucket;
  const sourceCid = signoff?.source?.collection;

  const signoffDest = signoff?.destination;
  const destBid = signoffDest?.bucket;
  const destCid = signoffDest?.collection;

  const newRecords = useRecordList(sourceBid, sourceCid, "id", true);
  const oldRecords = useRecordList(destBid, destCid, "id", true);

  if (!signoff) {
    return null;
  }

  if (!auth) {
    return (
      <div className="simple-review-blocked-message list-page">
        Not authenticated
      </div>
    );
  }

  const loadingServerInfo = !serverInfo;
  const isSigned = !loadingServerInfo && signoff;
  const loadingMetadata =
    isSigned && (signoff.source as SignoffSourceInfo).isLoading;
  const loadingRecords = isSigned && (!newRecords?.data || !oldRecords?.data);
  const isLoading = loadingServerInfo || loadingMetadata || loadingRecords;

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
    // At this point everything is loaded.
    if (!isSigned || !(signoff.source as SignoffSourceInfo).status) {
      // Collection is not signed or missing reviews attribute.
      return (
        <div className="alert alert-warning">
          This collection does not support reviews, or you do not have
          permission to review.
        </div>
      );
    }

    const signoffSource = signoff.source as SignoffSourceInfo;

    const canReview = signoffSource
      ? (isReviewer(signoffSource, serverInfo) &&
          serverInfo?.user?.id !== signoffSource.lastReviewRequestBy) ||
        !toReviewEnabled(serverInfo, signoffSource, signoffDest)
      : false;

    const canRequestReview =
      canEditCollection(permissions, bid, cid) &&
      isMember("editors_group", signoffSource, serverInfo);

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
        <SignedCollectionRecordDiffView
          collectionData={signoffSource}
          oldRecords={oldRecords.data ?? []}
          newRecords={newRecords.data ?? []}
          displayFields={collection?.displayFields || []}
        />
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
      <CollectionTabs bid={bid} cid={cid} selected="simple-review">
        {isLoading ? <Spinner /> : <SignoffContent />}
      </CollectionTabs>
    </div>
  );
}
