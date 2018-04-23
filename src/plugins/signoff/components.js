/* @flow */
import type { BucketState, SessionState, CollectionState } from "../../types";
import type {
  SignoffState,
  SourceInfo,
  PreviewInfo,
  DestinationInfo,
} from "./types";

import { PureComponent } from "react";
import * as React from "react";

import { canEditCollection } from "../../permission";
import { timeago, humanDate } from "../../utils";
import AdminLink from "../../components/AdminLink";
import { ProgressBar, ProgressStep } from "./ProgressBar.js";

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

function isReviewer(source, sessionState) {
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
  sessionState: SessionState,
  bucketState: BucketState,
  collectionState: CollectionState,
  signoff: SignoffState,
  requestReview: string => void,
  confirmRequestReview: () => void,
  approveChanges: () => void,
  declineChanges: string => void,
  confirmDeclineChanges: () => void,
  cancelPendingConfirm: () => void,
};

export default class SignoffToolBar extends React.Component<
  SignoffToolBarProps
> {
  render() {
    const {
      // Global state
      sessionState,
      bucketState,
      collectionState,
      // Plugin state
      signoff = {},
      // Actions
      confirmRequestReview,
      requestReview,
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

    // The above sagas refresh the global state via `routeLoadSuccess` actions.
    // Use the global so that the toolbar is refreshed when status changes.
    const {
      data: { status },
    } = collectionState;

    // Information loaded via this plugin.
    const {
      collectionsInfo,
      pendingConfirmReviewRequest,
      pendingConfirmDeclineChanges,
    } = signoff;
    // Hide toolbar if server has not kinto-signer plugin,
    // or if this collection is not configured to be signed.
    if (!collectionsInfo) {
      return null;
    }
    const { source, destination, preview } = collectionsInfo;

    const canRequestReview = canEdit && isEditor(source, sessionState);
    const canReview =
      canEdit &&
      isReviewer(source, sessionState) &&
      !hasRequestedReview(source, sessionState);
    const canSign = canEdit && isReviewer(source, sessionState);
    const hasHistory = "history" in sessionState.serverInfo.capabilities;

    // Default status is request review
    const step = status == "to-review" ? 1 : status == "signed" ? 2 : 0;
    return (
      <div>
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
            currentStep={step}
            canEdit={canRequestReview}
            confirmRequestReview={confirmRequestReview}
            source={source}
          />
          <Review
            label="Waiting review"
            step={1}
            currentStep={step}
            canEdit={canReview}
            hasHistory={hasHistory}
            approveChanges={approveChanges}
            confirmDeclineChanges={confirmDeclineChanges}
            source={source}
            preview={preview}
          />
          <Signed
            label="Signed"
            step={2}
            currentStep={step}
            canEdit={canSign}
            reSign={approveChanges}
            source={source}
            destination={destination}
          />
        </ProgressBar>
        {pendingConfirmReviewRequest && (
          <CommentDialog
            description="Leave some notes for the reviewer:"
            confirmLabel="Request review"
            onConfirm={requestReview}
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

function Comment({ text }: { text: string }): ?React.Element<*> {
  if (!text) {
    return null;
  }
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

function HumanDate({ timestamp }: { timestamp: number }) {
  return <span title={humanDate(timestamp)}>{timeago(timestamp)}</span>;
}

//
// Work in progress
//

type WorkInProgressProps = {
  label: string,
  canEdit: boolean,
  currentStep: number,
  step: number,
  confirmRequestReview: () => void,
  source: SourceInfo,
};

function WorkInProgress(props: WorkInProgressProps) {
  const {
    label,
    canEdit,
    currentStep,
    step,
    confirmRequestReview,
    source,
  } = props;

  const active = step == currentStep;
  const { lastEditBy, lastEditDate, lastReviewerComment } = source;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      <WorkInProgressInfos
        active={active}
        lastEditBy={lastEditBy}
        lastEditDate={lastEditDate}
        lastReviewerComment={lastReviewerComment}
      />
      {active &&
        lastEditDate &&
        canEdit && <RequestReviewButton onClick={confirmRequestReview} />}
    </ProgressStep>
  );
}

function WorkInProgressInfos(props) {
  const { active, lastEditBy, lastEditDate, lastReviewerComment } = props;
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
      {active &&
        lastReviewerComment && (
          <li>
            <strong>Comment: </strong> <Comment text={lastReviewerComment} />
          </li>
        )}
    </ul>
  );
}

function RequestReviewButton(props: { onClick: () => void }) {
  const { onClick } = props;
  return (
    <button className="btn btn-info request-review" onClick={onClick}>
      <i className="glyphicon glyphicon-comment" /> Request review...
    </button>
  );
}

//
// Review
//

type ReviewProps = {
  label: string,
  canEdit: boolean,
  hasHistory: boolean,
  currentStep: number,
  step: number,
  approveChanges: () => void,
  confirmDeclineChanges: () => void,
  source: SourceInfo,
  preview: ?PreviewInfo,
};

function Review(props: ReviewProps) {
  const {
    label,
    canEdit,
    hasHistory,
    currentStep,
    step,
    approveChanges,
    confirmDeclineChanges,
    source,
    preview,
  } = props;
  const active = step == currentStep;

  // If preview disabled, the preview object is empty.
  let link = "disabled";
  if (preview && preview.bid && preview.cid) {
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
          active={active}
          source={source}
          link={link}
          hasHistory={hasHistory}
        />
      )}
      {active &&
        canEdit && (
          <ReviewButtons
            onApprove={approveChanges}
            onDecline={confirmDeclineChanges}
          />
        )}
    </ProgressStep>
  );
}

type ReviewInfosProps = {
  active: boolean,
  source: SourceInfo,
  link: any,
  hasHistory: boolean,
};

function ReviewInfos(props: ReviewInfosProps) {
  const { active, source, link, hasHistory } = props;
  const {
    bid,
    cid,
    lastReviewRequestBy,
    lastReviewRequestDate,
    lastEditorComment,
    changes = {},
  } = source;
  const { since, deleted, updated } = changes;
  const detailsLink = hasHistory && (
    <AdminLink
      name="collection:history"
      params={{ bid, cid }}
      query={{ since, resource_name: "record" }}>
      details...
    </AdminLink>
  );

  return (
    <ul>
      <li>
        <strong>Requested: </strong>
        <HumanDate timestamp={lastReviewRequestDate} />
      </li>
      <li>
        <strong>By: </strong> {lastReviewRequestBy}
      </li>
      {active &&
        lastEditorComment && (
          <li>
            <strong>Comment: </strong> <Comment text={lastEditorComment} />
          </li>
        )}
      <li>
        <strong>Preview: </strong> {link}
      </li>
      {active && (
        <li>
          <strong>Changes: </strong>
          <DiffStats updated={updated} deleted={deleted} /> {detailsLink}
        </li>
      )}
    </ul>
  );
}

function DiffStats(props: { updated: number, deleted: number }) {
  const { updated, deleted } = props;
  return (
    <span className="diffstats">
      {updated > 0 && <span className="text-green">+{updated}</span>}
      {deleted > 0 && <span className="text-red">-{deleted}</span>}
    </span>
  );
}

function ReviewButtons(props: {
  onApprove: () => void,
  onDecline: () => void,
}) {
  const { onApprove, onDecline } = props;
  return (
    <div className="btn-group">
      <button className="btn btn-success" onClick={onApprove}>
        <i className="glyphicon glyphicon-ok" /> Approve
      </button>
      <button className="btn btn-danger" onClick={onDecline}>
        <i className="glyphicon glyphicon-comment" /> Decline...
      </button>
    </div>
  );
}

//
// Signed
//

type SignedProps = {
  label: string,
  canEdit: boolean,
  currentStep: number,
  step: number,
  reSign: () => void,
  source: SourceInfo,
  destination: ?DestinationInfo,
};

function Signed(props: SignedProps) {
  const {
    label,
    canEdit,
    currentStep,
    step,
    reSign,
    source,
    destination,
  } = props;
  const active = step == currentStep && canEdit;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {destination &&
        source.lastSignatureBy && (
          <SignedInfos source={source} destination={destination} />
        )}
      {active && <ReSignButton onClick={reSign} />}
    </ProgressStep>
  );
}

type SignedInfosProps = {
  source: SourceInfo,
  destination: DestinationInfo,
};

function SignedInfos(props: SignedInfosProps) {
  const { source, destination } = props;
  const {
    lastReviewBy,
    lastReviewDate,
    lastSignatureBy,
    lastSignatureDate,
  } = source;
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
      <li>
        <strong>Destination: </strong>
        <AdminLink name="collection:records" params={{ bid, cid }}>
          {`${bid}/${cid}`}
        </AdminLink>
      </li>
    </ul>
  );
}

function ReSignButton(props: { onClick: () => void }) {
  const { onClick } = props;
  return (
    <button className="btn btn-info" onClick={onClick}>
      <i className="glyphicon glyphicon-repeat" /> Re-sign
    </button>
  );
}

//
// Comment dialog
//
type CommentDialogProps = {
  description: string,
  confirmLabel: string,
  onConfirm: string => void,
  onCancel: () => void,
};

type CommentDialogState = {
  comment: string,
};

class CommentDialog extends PureComponent<
  CommentDialogProps,
  CommentDialogState
> {
  constructor(props: Object) {
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
      <div className="modal-open">
        <div
          className="modal fade in"
          role="dialog"
          style={{ display: "block" }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" onClick={onCancel}>
                  <span>×</span>
                </button>
                <h4 className="modal-title">Confirmation</h4>
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
                  className="btn btn-default"
                  onClick={onCancel}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onClickConfirm}>
                  <i className="glyphicon glyphicon-ok" /> {confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
