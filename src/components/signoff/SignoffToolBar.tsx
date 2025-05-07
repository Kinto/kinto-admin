import AdminLink from "../AdminLink";
import Spinner from "../Spinner";
import { Comment, CommentDialog } from "./Comment";
import HumanDate from "./HumanDate";
import { ProgressBar, ProgressStep } from "./ProgressBar";
import { DiffInfo, Review } from "./Review";
import { Signed } from "./Signed";
import { isMember, toReviewEnabled } from "./utils";
import { useCollection } from "@src/hooks/collection";
import { useSignoff } from "@src/hooks/signoff";
import { canEditCollection } from "@src/permission";
import type {
  ChangesList,
  SessionState,
  SignoffSourceInfo,
  SignoffState,
} from "@src/types";
import React, { useEffect, useState } from "react";
import { ChatLeft, XCircleFill } from "react-bootstrap-icons";
import { useParams } from "react-router";

function isEditor(source, sessionState) {
  return isMember("editors_group", source, sessionState);
}

export function isReviewer(
  source: SignoffSourceInfo,
  sessionState: SessionState
) {
  return isMember("reviewers_group", source, sessionState);
}

function hasRequestedReview(source, sessionState) {
  const {
    serverInfo: { user = {} },
  } = sessionState;
  const { lastReviewRequestBy } = source;
  return user.id === lastReviewRequestBy;
}

type SignoffToolBarProps = {
  sessionState: SessionState;
  signoff: SignoffState;
  requestReview: (s: string) => void;
  rollbackChanges: (s: string) => void;
  confirmRollbackChanges: () => void;
  confirmRequestReview: () => void;
  approveChanges: () => void;
  declineChanges: (s: string) => void;
  confirmDeclineChanges: () => void;
  cancelPendingConfirm: () => void;
};

export default function SignoffToolBar({
  sessionState,
  confirmRequestReview,
  requestReview,
  rollbackChanges,
  confirmRollbackChanges,
  approveChanges,
  confirmDeclineChanges,
  cancelPendingConfirm,
  declineChanges,
}: SignoffToolBarProps) {
  const { bid, cid } = useParams();
  const [showSpinner, setShowSpinner] = useState(false);
  const collection = useCollection(bid, cid);
  const signoff = useSignoff(
    bid,
    cid,
    sessionState.serverInfo.capabilities.signer
  );

  const handleApproveChanges = () => {
    setShowSpinner(true);
    approveChanges();
  };

  useEffect(() => {
    if (showSpinner) {
      setShowSpinner(false);
    }
  }, [collection]);

  const canEdit = canEditCollection(sessionState, bid, cid);

  if (!signoff?.source || !sessionState.serverInfo.capabilities.signer) {
    return null;
  }

  const {
    pendingConfirmReviewRequest,
    pendingConfirmRollbackChanges,
    pendingConfirmDeclineChanges,
    source,
    destination,
    preview,
    changesOnSource,
    changesOnPreview,
  } = signoff;

  const canRequestReview = canEdit && isEditor(source, sessionState);

  const canReview =
    canEdit &&
    ((isReviewer(source, sessionState) &&
      !hasRequestedReview(source, sessionState)) ||
      !toReviewEnabled(sessionState, source, destination));
  const canRollback = canEdit;
  const hasHistory = "history" in sessionState.serverInfo.capabilities;

  const isCurrentUrl = source.bucket == bid && source.collection == cid;
  const currentStep = Math.max(
    ["work-in-progress", "to-review", "signed"].indexOf(source.status),
    0
  );

  return (
    <div className={isCurrentUrl ? "interactive" : "informative"}>
      {hasHistory ? null : (
        <div className="alert alert-warning">
          <p>
            <b>
              Plugin which tracks history of changes is not enabled on this
              server.
            </b>
            Please reach to the server administrator.
          </p>
        </div>
      )}
      <ProgressBar>
        <WorkInProgress
          label="Work in progress"
          step={0}
          currentStep={currentStep}
          isCurrentUrl={isCurrentUrl}
          canEdit={canRequestReview}
          hasHistory={hasHistory}
          confirmRequestReview={confirmRequestReview}
          source={source}
          changes={changesOnSource}
        />
        <Review
          label="Waiting review"
          step={1}
          currentStep={currentStep}
          isCurrentUrl={
            !!preview && preview.bucket == bid && preview.collection == cid
          }
          canEdit={canReview}
          hasHistory={hasHistory}
          approveChanges={handleApproveChanges}
          confirmDeclineChanges={confirmDeclineChanges}
          source={source}
          preview={preview}
          changes={changesOnPreview}
        />
        <Signed
          label="Approved"
          step={2}
          currentStep={currentStep}
          isCurrentUrl={
            destination.bucket == bid && destination.collection == cid
          }
          source={source}
          destination={destination}
        />
      </ProgressBar>

      {canRollback && status != "signed" && (
        <RollbackChangesButton onClick={confirmRollbackChanges} />
      )}
      {pendingConfirmReviewRequest && (
        <CommentDialog
          description="Leave some notes for the reviewer:"
          confirmLabel="Request review"
          onConfirm={requestReview}
          onClose={cancelPendingConfirm}
        />
      )}
      {pendingConfirmRollbackChanges && (
        <CommentDialog
          description="This will reset the collection to the latest approved content. All pending changes will be lost. Are you sure?"
          confirmLabel="Rollback changes"
          onConfirm={rollbackChanges}
          onClose={cancelPendingConfirm}
        />
      )}
      {pendingConfirmDeclineChanges && (
        <CommentDialog
          description="Leave some notes for the editor:"
          confirmLabel="Decline changes"
          onConfirm={declineChanges}
          onClose={cancelPendingConfirm}
        />
      )}
      {showSpinner && <Spinner />}
    </div>
  );
}

//
// Work in progress
//

type WorkInProgressProps = {
  label: string;
  canEdit: boolean;
  currentStep: number;
  step: number;
  isCurrentUrl: boolean;
  confirmRequestReview: () => void;
  source: SignoffSourceInfo;
  hasHistory: boolean;
  changes: ChangesList | null;
};

function WorkInProgress(props: WorkInProgressProps) {
  const {
    label,
    canEdit,
    currentStep,
    step,
    isCurrentUrl,
    confirmRequestReview,
    source,
    hasHistory,
    changes,
  } = props;

  const isCurrentStep = step == currentStep;

  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      <WorkInProgressInfos
        isCurrentStep={isCurrentStep}
        isCurrentUrl={isCurrentUrl}
        source={source}
        hasHistory={hasHistory}
        changes={changes}
      />
      {isCurrentStep && source.lastEditDate && canEdit && (
        <RequestReviewButton onClick={confirmRequestReview} />
      )}
    </ProgressStep>
  );
}

type WorkInProgressInfosProps = {
  isCurrentStep: boolean;
  isCurrentUrl: boolean;
  source: SignoffSourceInfo;
  hasHistory: boolean;
  changes: ChangesList | null;
};
function WorkInProgressInfos(props: WorkInProgressInfosProps) {
  const { isCurrentStep, isCurrentUrl, source, hasHistory, changes } = props;
  const { bucket, collection, lastEditBy, lastEditDate, lastReviewerComment } =
    source;
  if (!lastEditDate) {
    return (
      <ul>
        <li>Never updated</li>
      </ul>
    );
  }
  return (
    <ul>
      <li>
        <strong>Updated: </strong>
        <HumanDate timestamp={lastEditDate} />
      </li>
      <li>
        <strong>By: </strong> {lastEditBy}
      </li>
      {isCurrentStep && lastReviewerComment && (
        <li>
          <strong>Comment: </strong> <Comment text={lastReviewerComment} />
        </li>
      )}
      {!isCurrentUrl && (
        <li>
          <strong>Source: </strong>
          <AdminLink name="collection:records" params={{ bucket, collection }}>
            {`${bucket}/${collection}`}
          </AdminLink>
        </li>
      )}
      {isCurrentStep && changes && (
        <DiffInfo
          hasHistory={hasHistory}
          bid={bucket}
          cid={collection}
          changes={changes}
        />
      )}
    </ul>
  );
}

function RequestReviewButton(props: { onClick: () => void }) {
  const { onClick } = props;
  return (
    <button className="btn btn-info request-review" onClick={onClick}>
      <ChatLeft className="icon" /> Request review...
    </button>
  );
}

function RollbackChangesButton(props: { onClick: () => void }) {
  const { onClick } = props;
  return (
    <button className="btn btn-danger rollback-changes" onClick={onClick}>
      <XCircleFill className="icon" /> Rollback changes...
    </button>
  );
}
