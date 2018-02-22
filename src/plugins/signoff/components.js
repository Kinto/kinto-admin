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

function isMember(groupKey, source, sessionState, bucketState) {
  const { serverInfo: { user = {}, capabilities } } = sessionState;
  if (!source || !user.id) {
    return false;
  }
  const { signer = {} } = capabilities;
  const { [groupKey]: defaultGroupName } = signer;
  const { [groupKey]: groupName = defaultGroupName } = source;
  const { id: userId } = user;
  const { groups } = bucketState;
  const group = groups.find(g => g.id === groupName);
  if (group == null) {
    // XXX for now if we can't access the group it's probably because the user
    // doesn't have the permission to read it, so we mark the user has a member
    // of the group.
    // Later when https://github.com/Kinto/kinto/pull/891/files lands, we'll
    // have access to the principals attached to a given authentication, so we'll
    // be able to properly check for membership.
    return true;
  }
  return group.members.includes(userId);
}

function isEditor(source, sessionState, bucketState) {
  return isMember("editors_group", source, sessionState, bucketState);
}

function isReviewer(source, sessionState, bucketState) {
  return isMember("reviewers_group", source, sessionState, bucketState);
}

function isLastEditor(source, sessionState) {
  const { serverInfo: { user = {} } } = sessionState;
  const { lastEditor } = source;
  return user.id === lastEditor;
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
    const { data: { status } } = collectionState;

    // Information loaded via this plugin.
    const {
      collections,
      pendingConfirmReviewRequest,
      pendingConfirmDeclineChanges,
    } = signoff;
    // Hide toolbar if server has not kinto-signer plugin,
    // or if this collection is not configured to be signed.
    if (!collections) {
      return null;
    }
    const { source, destination, preview } = collections;

    const canRequestReview =
      canEdit && isEditor(source, sessionState, bucketState);
    const canReview =
      canEdit &&
      isReviewer(source, sessionState, bucketState) &&
      !isLastEditor(source, sessionState);
    const canSign = canEdit && isReviewer(source, sessionState, bucketState);
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
  const { lastAuthor, lastReviewerComment, changes = {} } = source;
  const { lastUpdated } = changes;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      <WorkInProgressInfos
        active={active}
        lastAuthor={lastAuthor}
        lastUpdated={lastUpdated}
        lastReviewerComment={lastReviewerComment}
      />
      {active &&
        lastUpdated &&
        canEdit && <RequestReviewButton onClick={confirmRequestReview} />}
    </ProgressStep>
  );
}

function WorkInProgressInfos(props) {
  const { active, lastAuthor, lastUpdated, lastReviewerComment } = props;
  if (!lastUpdated) {
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
        <HumanDate timestamp={lastUpdated} />
      </li>
      <li>
        <strong>By: </strong> {lastAuthor}
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
    <button className="btn btn-info" onClick={onClick}>
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
  // We use the source last status change as review request datetime.
  let link = "disabled";
  let { lastStatusChanged: lastRequested } = source;
  if (preview && preview.bid && preview.cid) {
    lastRequested = preview.lastRequested;
    const { bid, cid } = preview;
    link = (
      <AdminLink name="collection:records" params={{ bid, cid }}>
        {`${bid}/${cid}`}
      </AdminLink>
    );
  }

  const { lastEditor } = source;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {lastEditor && (
        <ReviewInfos
          active={active}
          source={source}
          lastRequested={lastRequested}
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
  lastRequested: number,
  link: any,
  hasHistory: boolean,
};

function ReviewInfos(props: ReviewInfosProps) {
  const { active, source, lastRequested, link, hasHistory } = props;
  const { bid, cid, lastEditor, lastEditorComment, changes = {} } = source;
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
        <HumanDate timestamp={lastRequested} />
      </li>
      <li>
        <strong>By: </strong> {lastEditor}
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
  const { lastReviewer } = source;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {destination &&
        destination.lastSigned && (
          <SignedInfos lastReviewer={lastReviewer} destination={destination} />
        )}
      {active && <ReSignButton onClick={reSign} />}
    </ProgressStep>
  );
}

type SignedInfosProps = {
  lastReviewer: string,
  destination: DestinationInfo,
};

function SignedInfos(props: SignedInfosProps) {
  const { lastReviewer, destination } = props;
  const { lastSigned, bid, cid } = destination;
  return (
    <ul>
      <li>
        <strong>Signed: </strong>
        <HumanDate timestamp={lastSigned} />
      </li>
      <li>
        <strong>By: </strong>
        {lastReviewer}
      </li>
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
