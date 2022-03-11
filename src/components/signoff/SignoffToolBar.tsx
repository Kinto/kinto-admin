import type { BucketState, SessionState, CollectionState } from "../../types";
import type {
  SignoffState,
  SignoffSourceInfo,
  PreviewInfo,
  DestinationInfo,
  ChangesList,
} from "../../types";

import { PureComponent } from "react";
import * as React from "react";

import { ChatLeft } from "react-bootstrap-icons";
import { XCircleFill } from "react-bootstrap-icons";
import { Check2 } from "react-bootstrap-icons";

import { canEditCollection } from "../../permission";
import { timeago, humanDate } from "../../utils";
import AdminLink from "../AdminLink";
import { ProgressBar, ProgressStep } from "./ProgressBar";

function isMember(groupKey, source, sessionState) {
  const {
    serverInfo: { user = {}, capabilities },
  } = sessionState;
  if (!source || !user.principals) {
    return false;
  }
  const { principals } = user;
  const { bid, cid } = source;
  const { signer = {} } = capabilities;
  const { [groupKey]: defaultGroupName } = signer;
  const { [groupKey]: groupName = defaultGroupName } = source;
  const expectedGroup = groupName.replace("{collection_id}", cid);
  const expectedPrincipal = `/buckets/${bid}/groups/${expectedGroup}`;

  return principals.includes(expectedPrincipal);
}

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
  bucketState: BucketState;
  collectionState: CollectionState;
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

export default class SignoffToolBar extends React.Component<SignoffToolBarProps> {
  render() {
    const {
      // Global state
      sessionState,
      bucketState,
      collectionState,
      signoff = {} as SignoffState,
      // Actions
      confirmRequestReview,
      requestReview,
      rollbackChanges,
      confirmRollbackChanges,
      approveChanges,
      confirmDeclineChanges,
      cancelPendingConfirm,
      declineChanges,
    } = this.props;

    const canEdit = canEditCollection(
      sessionState,
      bucketState,
      collectionState
    );

    const {
      data: { id: bid },
    } = bucketState;

    // The above sagas refresh the global state via `routeLoadSuccess` actions.
    // Use the global so that the toolbar is refreshed when status changes.
    const {
      data: { id: cid },
    } = collectionState;

    const {
      collectionsInfo,
      pendingConfirmReviewRequest,
      pendingConfirmRollbackChanges,
      pendingConfirmDeclineChanges,
    } = signoff;

    // Hide toolbar if signer capability is not enabled on the server or
    // collection not configured to be signed
    if (!collectionsInfo) {
      return null;
    }

    const { source, destination, preview, changesOnSource, changesOnPreview } =
      collectionsInfo;

    const { status } = source;

    const canRequestReview = canEdit && isEditor(source, sessionState);
    const canReview =
      canEdit &&
      isReviewer(source, sessionState) &&
      !hasRequestedReview(source, sessionState);
    const canRollback = canEdit;
    const hasHistory = "history" in sessionState.serverInfo.capabilities;

    const isCurrentUrl = source.bid == bid && source.cid == cid;
    // Default status is request review
    const currentStep = status == "to-review" ? 1 : status == "signed" ? 2 : 0;
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
            isCurrentUrl={!!preview && preview.bid == bid && preview.cid == cid}
            canEdit={canReview}
            hasHistory={hasHistory}
            approveChanges={approveChanges}
            confirmDeclineChanges={confirmDeclineChanges}
            source={source}
            preview={preview}
            changes={changesOnPreview}
          />
          <Signed
            label="Approved"
            step={2}
            currentStep={currentStep}
            isCurrentUrl={destination.bid == bid && destination.cid == cid}
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
            onCancel={cancelPendingConfirm}
          />
        )}
        {pendingConfirmRollbackChanges && (
          <CommentDialog
            description="This will reset the collection to the latest approved content. All pending changes will be lost. Are you sure?"
            confirmLabel="Rollback changes"
            onConfirm={rollbackChanges}
            onCancel={cancelPendingConfirm}
          />
        )}
        {pendingConfirmDeclineChanges && (
          <CommentDialog
            description="Leave some notes for the editor:"
            confirmLabel="Decline changes"
            onConfirm={declineChanges}
            onCancel={cancelPendingConfirm}
          />
        )}
      </div>
    );
  }
}

function Comment({ text }: { text: string }) {
  return (
    <span title={text} className="signoff-comment">
      {text.split("\n").map((l, i) => (
        <span key={i}>
          {l}
          <br />
        </span>
      ))}
    </span>
  );
}

function HumanDate({ timestamp }: { timestamp?: number | null }) {
  if (!timestamp) {
    return <>{"N/A"}</>;
  }
  return <span title={humanDate(timestamp)}>{timeago(timestamp)}</span>;
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
  const { bid, cid, lastEditBy, lastEditDate, lastReviewerComment } = source;
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
          <AdminLink name="collection:records" params={{ bid, cid }}>
            {`${bid}/${cid}`}
          </AdminLink>
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
    <button className="btn btn-info rollback-changes" onClick={onClick}>
      <XCircleFill className="icon" /> Rollback changes...
    </button>
  );
}

//
// Review
//

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

function Review(props: ReviewProps) {
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

function DiffInfo(props: {
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

//
// Signed
//

type SignedProps = {
  label: string;
  currentStep: number;
  step: number;
  isCurrentUrl: boolean;
  source: SignoffSourceInfo;
  destination: DestinationInfo | null;
};

function Signed(props: SignedProps) {
  const { label, currentStep, step, isCurrentUrl, source, destination } = props;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {destination && source.lastSignatureBy && (
        <SignedInfos
          source={source}
          destination={destination}
          isCurrentUrl={isCurrentUrl}
        />
      )}
    </ProgressStep>
  );
}

type SignedInfosProps = {
  isCurrentUrl: boolean;
  source: SignoffSourceInfo;
  destination: DestinationInfo;
};

function SignedInfos(props: SignedInfosProps) {
  const { isCurrentUrl, source, destination } = props;
  const { lastReviewBy, lastReviewDate, lastSignatureBy, lastSignatureDate } =
    source;
  const { bid, cid } = destination;
  return (
    <ul>
      <li>
        <strong>Approved: </strong>
        <HumanDate timestamp={lastReviewDate} />
      </li>
      <li>
        <strong>By: </strong>
        {lastReviewBy}
      </li>
      {lastReviewDate != lastSignatureDate && (
        <li>
          <strong>Re-signed: </strong>
          <HumanDate timestamp={lastSignatureDate} />
        </li>
      )}
      {lastReviewDate != lastSignatureDate && ( // just to avoid SyntaxError: Adjacent JSX elements
        <li>
          <strong>By: </strong>
          {lastSignatureBy}
        </li>
      )}
      {!isCurrentUrl && (
        <li>
          <strong>Destination: </strong>
          <AdminLink name="collection:records" params={{ bid, cid }}>
            {`${bid}/${cid}`}
          </AdminLink>
        </li>
      )}
    </ul>
  );
}

//
// Comment dialog
//
type CommentDialogProps = {
  description: string;
  confirmLabel: string;
  onConfirm: (s: string) => void;
  onCancel: () => void;
};

type CommentDialogState = {
  comment: string;
};

class CommentDialog extends PureComponent<
  CommentDialogProps,
  CommentDialogState
> {
  constructor(props: CommentDialogProps) {
    super(props);
    this.state = {
      comment: "",
    };
  }

  onCommentChange = e => {
    this.setState({ comment: e.target.value });
  };

  render() {
    const { description, confirmLabel, onConfirm, onCancel } = this.props;
    const { comment } = this.state;
    const onClickConfirm = () => onConfirm(comment);

    return (
      <div
        className="modal"
        tabIndex={-1}
        role="dialog"
        style={{ display: "block" }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirmation</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={onCancel}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>{description}</p>
              <textarea
                className="form-control"
                placeholder="Comment..."
                onChange={this.onCommentChange}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClickConfirm}
              >
                {confirmLabel}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={onCancel}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
