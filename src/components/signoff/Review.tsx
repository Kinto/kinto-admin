import AdminLink from "../AdminLink";
import { Comment } from "./Comment";
import { ProgressStep } from "./ProgressBar";
import { groupName, suggestReviewers } from "./utils";
import HumanDate from "@src/components/HumanDate";
import Spinner from "@src/components/Spinner";
import { useGroup } from "@src/hooks/group";
import { useServerInfo } from "@src/hooks/session";
import { useLatestApprovals } from "@src/hooks/signoff";
import type {
  ChangesList,
  SignerCapabilityResourceEntry,
  SignoffSourceInfo,
} from "@src/types";
import type { ReactNode } from "react";
import { Braces, InfoCircle } from "react-bootstrap-icons";

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
  let link: ReactNode = "disabled";
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
  link: ReactNode;
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
      {isCurrentStep && <Reviewers source={source} />}
    </ul>
  );
}

function Reviewers({ source }: { source: SignoffSourceInfo }) {
  const { data: serverInfo } = useServerInfo();
  const group = useGroup(
    source.bucket,
    groupName("reviewers_group", source, serverInfo)
  );
  const approvals = useLatestApprovals(
    serverInfo,
    source.bucket,
    source.collection,
    source.lastModified
  );
  const reviewers =
    group?.data && approvals
      ? suggestReviewers(
          group.data.members,
          approvals,
          source.lastReviewRequestBy
        )
      : undefined;
  return (
    <li>
      <details>
        <summary>
          <strong title="Reviewers are usually notified automatically. To speed things up, reach out to one of these reviewers directly.">
            Suggested Reviewers <InfoCircle className="icon" />
          </strong>
        </summary>
        <ul>
          {reviewers === undefined && (
            <li>
              <Spinner />
            </li>
          )}
          {reviewers?.length === 0 && <li>None</li>}
          {reviewers?.map(({ id, lastApproval }) => (
            <li key={id}>
              {id}
              {lastApproval && (
                <>
                  , last reviewed <HumanDate timestamp={lastApproval} />
                </>
              )}
            </li>
          ))}
        </ul>
      </details>
    </li>
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
