import type { SignoffSourceInfo, PreviewInfo, ChangesList } from "../../types";

import React from "react";
import { Comment } from "./Comment";

import { ChatLeft } from "react-bootstrap-icons";
import { Check2 } from "react-bootstrap-icons";

import AdminLink from "../AdminLink";
import { ProgressStep } from "./ProgressBar";
import HumanDate from "./HumanDate";

type ReviewProps = {
  label: string;
  canEdit: boolean;
  hasHistory: boolean;
  currentStep: number;
  step: number;
  isCurrentUrl: boolean;
  approveChanges: () => void;
  confirmDeclineChanges: () => void;
  source: SignoffSourceInfo;
  preview: PreviewInfo | null;
  changes: ChangesList | null;
};

export function Review(props: ReviewProps) {
  const {
    label,
    canEdit,
    hasHistory,
    currentStep,
    step,
    isCurrentUrl,
    approveChanges,
    confirmDeclineChanges,
    source,
    preview,
    changes,
  } = props;
  const isCurrentStep = step == currentStep;

  // If preview disabled, the preview object is empty.
  let link: React.ReactNode = "disabled";
  if (preview) {
    const { bid, cid } = preview;
    link = (
      <AdminLink name="collection:records" params={{ bid, cid }}>
        {`${bid}/${cid}`}
      </AdminLink>
    );
  }

  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {source.lastReviewRequestBy && (
        <ReviewInfos
          isCurrentStep={isCurrentStep}
          isCurrentUrl={isCurrentUrl}
          source={source}
          link={link}
          hasHistory={hasHistory}
          changes={changes}
        />
      )}
      {isCurrentStep && canEdit && (
        <ReviewButtons
          onApprove={approveChanges}
          onDecline={confirmDeclineChanges}
        />
      )}
    </ProgressStep>
  );
}

type ReviewInfosProps = {
  isCurrentStep: boolean;
  source: SignoffSourceInfo;
  link: React.ReactNode;
  isCurrentUrl: boolean;
  hasHistory: boolean;
  changes: ChangesList | null;
};

function ReviewInfos(props: ReviewInfosProps) {
  const { isCurrentStep, source, link, hasHistory, changes, isCurrentUrl } =
    props;
  const {
    bid,
    cid,
    lastReviewRequestBy,
    lastReviewRequestDate,
    lastEditorComment,
  } = source;
  return (
    <ul>
      <li>
        <strong>Requested: </strong>
        <HumanDate timestamp={lastReviewRequestDate} />
      </li>
      <li>
        <strong>By: </strong> {lastReviewRequestBy}
      </li>
      {isCurrentStep && lastEditorComment && (
        <li>
          <strong>Comment: </strong> <Comment text={lastEditorComment} />
        </li>
      )}
      {!isCurrentUrl && (
        <li>
          <strong>Preview: </strong> {link}
        </li>
      )}
      {isCurrentStep && changes && (
        <DiffInfo
          hasHistory={hasHistory}
          bid={bid}
          cid={cid}
          changes={changes}
        />
      )}
    </ul>
  );
}

export function DiffInfo(props: {
  bid: string;
  cid: string;
  hasHistory: boolean;
  changes: ChangesList;
}) {
  const { bid, cid, changes, hasHistory } = props;
  const { since, deleted = 0, updated = 0 } = changes || {};
  if (deleted === 0 && updated === 0) {
    return null;
  }
  const detailsLink = hasHistory && (
    <AdminLink
      name="collection:history"
      params={{ bid, cid }}
      query={{
        since,
        resource_name: "record",
        exclude_user_id: "plugin:kinto-signer",
      }}
    >
      details...
    </AdminLink>
  );
  return (
    <li>
      <strong>Changes: </strong>
      <span className="diffstats">
        {updated > 0 && <span className="text-green">+{updated}</span>}
        {deleted > 0 && <span className="text-red">-{deleted}</span>}
      </span>{" "}
      {detailsLink}
    </li>
  );
}

function ReviewButtons(props: {
  onApprove: () => void;
  onDecline: () => void;
}) {
  const { onApprove, onDecline } = props;
  return (
    <div className="btn-group">
      <button className="btn btn-success" onClick={onApprove}>
        <Check2 className="icon" /> Approve
      </button>
      <button className="btn btn-danger" onClick={onDecline}>
        <ChatLeft className="icon" /> Decline...
      </button>
    </div>
  );
}
