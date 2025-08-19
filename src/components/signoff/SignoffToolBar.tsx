import AdminLink from "../AdminLink";
import Spinner from "../Spinner";
import { Comment, CommentDialog } from "./Comment";
import { ProgressBar, ProgressStep } from "./ProgressBar";
import { DiffInfo, Review } from "./Review";
import { Signed } from "./Signed";
import { isMember, toReviewEnabled } from "./utils";
import { getClient } from "@src/client";
import HumanDate from "@src/components/HumanDate";
import { useCollection } from "@src/hooks/collection";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import { useSimpleReview } from "@src/hooks/preferences";
import { usePermissions, useServerInfo } from "@src/hooks/session";
import { useSignoff } from "@src/hooks/signoff";
import { canEditCollection } from "@src/permission";
import type {
  ChangesList,
  ServerInfo,
  SignoffCollectionsInfo,
  SignoffSourceInfo,
} from "@src/types";
import React, { useEffect, useState } from "react";
import { ChatLeft, XCircleFill } from "react-bootstrap-icons";
import { useParams } from "react-router";

function isEditor(source, serverInfo) {
  return isMember("editors_group", source, serverInfo);
}

export function isReviewer(source: SignoffSourceInfo, serverInfo: ServerInfo) {
  return isMember("reviewers_group", source, serverInfo);
}

function hasRequestedReview(source, serverInfo) {
  const { user = {} } = serverInfo;
  const { lastReviewRequestBy } = source;
  return user.id === lastReviewRequestBy;
}

interface SignoffToolBarProps {
  callback: () => void;
}

export default function SignoffToolBar({ callback }: SignoffToolBarProps) {
  const { bid, cid } = useParams();
  const [cacheVal, setCacheVal] = useState(0);
  const serverInfo = useServerInfo();
  const permissions = usePermissions();
  const [showSpinner, setShowSpinner] = useState(false);
  const collection = useCollection(bid, cid, cacheVal);
  const signoff = useSignoff(
    bid,
    cid,
    serverInfo?.capabilities?.signer,
    cacheVal
  );
  const [pendingConfirm, setPendingConfirm] = useState("");
  const [simpleReview] = useSimpleReview();

  const reviewAction = async patchedFields => {
    setShowSpinner(true);
    await getClient().bucket(bid).collection(cid).setData(patchedFields, {
      safe: true,
      patch: true,
      last_modified: collection.last_modified,
    });
    setCacheVal(cacheVal + 1);
    callback();
  };

  const rollbackChanges = async (text: string) => {
    try {
      await reviewAction({
        status: "to-rollback",
        last_editor_comment: text,
      });
      notifySuccess("Changes rolled back.");
    } catch (ex) {
      notifyError("Couldn't rollback changes", ex);
    }
  };

  const approveChanges = async () => {
    try {
      await reviewAction({
        status: "to-sign",
        last_reviewer_comment: "",
      });
      notifySuccess("Changes approved.");
    } catch (ex) {
      notifyError("Couldn't approve review", ex);
    }
  };

  const declineChanges = async (text: string) => {
    try {
      await reviewAction({
        status: "work-in-progress",
        last_reviewer_comment: text,
      });
      notifySuccess("Changes declined.");
    } catch (ex) {
      notifyError("Couldn't decline changes", ex);
    }
  };

  const requestReview = async (text: string) => {
    try {
      await reviewAction({
        status: "to-review",
        last_editor_comment: text,
      });
      notifySuccess("Review requested.");
    } catch (ex) {
      notifyError("Couldn't request review", ex);
    }
  };

  useEffect(() => {
    if (showSpinner) {
      setShowSpinner(false);
    }
  }, [collection]);

  const canEdit = canEditCollection(permissions, bid, cid);

  if (!serverInfo?.capabilities?.signer || !signoff) {
    return null;
  }

  if (!("status" in signoff.source)) {
    return <Spinner />;
  }

  // At this point, signoff is loaded (not null and with `status` field)
  const { source, destination, preview, changesOnSource, changesOnPreview } =
    signoff as SignoffCollectionsInfo;

  const canRequestReview = canEdit && isEditor(source, serverInfo);

  const canReview =
    canEdit &&
    ((isReviewer(source, serverInfo) &&
      !hasRequestedReview(source, serverInfo)) ||
      !toReviewEnabled(serverInfo, source, destination));
  const canRollback = canEdit;
  const hasHistory = serverInfo && "history" in serverInfo.capabilities;

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
      {!simpleReview && (
        <div className="alert alert-warning">
          <p>⚠️ This legacy review UI will be removed in the next versions.</p>
          <p>
            If you still rely on it actively, please contact the development
            team to make sure your workflows will be well supported in the
            future design.
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
          confirmRequestReview={() => {
            setPendingConfirm("review");
          }}
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
          approveChanges={approveChanges}
          confirmDeclineChanges={() => {
            setPendingConfirm("decline");
          }}
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

      {canRollback && source.status != "signed" && (
        <RollbackChangesButton
          onClick={() => {
            setPendingConfirm("rollback");
          }}
        />
      )}
      {pendingConfirm == "review" && (
        <CommentDialog
          description="Leave some notes for the reviewer:"
          confirmLabel="Request review"
          onConfirm={requestReview}
          onClose={() => {
            setPendingConfirm("");
          }}
        />
      )}
      {pendingConfirm == "rollback" && (
        <CommentDialog
          description="This will reset the collection to the latest approved content. All pending changes will be lost. Are you sure?"
          confirmLabel="Rollback changes"
          onConfirm={rollbackChanges}
          onClose={() => {
            setPendingConfirm("");
          }}
        />
      )}
      {pendingConfirm == "decline" && (
        <CommentDialog
          description="Leave some notes for the editor:"
          confirmLabel="Decline changes"
          onConfirm={declineChanges}
          onClose={() => {
            setPendingConfirm("");
          }}
        />
      )}
      {(showSpinner || !signoff?.source?.status) && <Spinner />}
    </div>
  );
}

//
// Work in progress
//

interface WorkInProgressProps {
  label: string;
  canEdit: boolean;
  currentStep: number;
  step: number;
  isCurrentUrl: boolean;
  confirmRequestReview: () => void;
  source: SignoffSourceInfo;
  hasHistory: boolean;
  changes: ChangesList | null;
}

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

interface WorkInProgressInfosProps {
  isCurrentStep: boolean;
  isCurrentUrl: boolean;
  source: SignoffSourceInfo;
  hasHistory: boolean;
  changes: ChangesList | null;
}
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
          <AdminLink
            name="collection:records"
            params={{ bid: bucket, cid: collection }}
          >
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
