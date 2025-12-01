import AdminLink from "../AdminLink";
import { Comment } from "./Comment";
import { ProgressStep } from "./ProgressBar";
import HumanDate from "@src/components/HumanDate";
import type {
  ChangesList,
  SignerCapabilityResourceEntry,
  SignoffSourceInfo,
} from "@src/types";
import React from "react";
import { Braces } from "react-bootstrap-icons";

interface ReviewProps {
  label: string;
  canEdit: boolean;
  currentStep: number;
  step: number;
  isCurrentUrl: boolean;
  source: SignoffSourceInfo;
  preview: SignerCapabilityResourceEntry | null;
  changes: ChangesList | null;
}

export function Review({
  label,
  canEdit,
  currentStep,
  step,
  isCurrentUrl,
  source,
  preview,
  changes,
}: ReviewProps) {
  const isCurrentStep = step == currentStep;

  // If preview disabled, the preview object is empty.
  let link: React.ReactNode = "disabled";
  if (preview) {
    const { bucket, collection } = preview;
    link = (
      <AdminLink
        name="collection:records"
        params={{ bid: bucket, cid: collection }}
      >
        {`${bucket}/${collection}`}
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
          changes={changes}
        />
      )}
      {isCurrentStep && canEdit && (
        <AdminLink
          className="btn btn-primary"
          params={{ bid: source.bucket, cid: source.collection }}
          name="collection:simple-review"
        >
          <Braces className="icon" /> Review Changes
        </AdminLink>
      )}
    </ProgressStep>
  );
}

interface ReviewInfosProps {
  isCurrentStep: boolean;
  source: SignoffSourceInfo;
  link: React.ReactNode;
  isCurrentUrl: boolean;
  changes: ChangesList | null;
}

function ReviewInfos(props: ReviewInfosProps) {
  const { isCurrentStep, source, link, changes, isCurrentUrl } = props;
  const { lastReviewRequestBy, lastReviewRequestDate, lastEditorComment } =
    source;
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
      {isCurrentStep && changes && <DiffInfo changes={changes} />}
    </ul>
  );
}

export function DiffInfo(props: { changes: ChangesList }) {
  const { changes } = props;
  const { deleted = 0, updated = 0 } = changes || {};
  if (deleted === 0 && updated === 0) {
    return null;
  }
  return (
    <li>
      <strong>Changes: </strong>
      <span className="diffstats">
        {updated > 0 && <span className="text-green">+{updated}</span>}
        {deleted > 0 && <span className="text-red">-{deleted}</span>}
      </span>
    </li>
  );
}
