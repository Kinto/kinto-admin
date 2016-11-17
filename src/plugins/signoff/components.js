/* @flow */
import type {
  BucketState,
  SessionState,
  CollectionState,
} from "../../types";
import type {
  SignoffState,
  SourceInfo,
  PreviewInfo,
  DestinationInfo,
} from "./types";

import React from "react";

import { canEditCollection } from "../../permission";
import { timeago, humanDate } from "../../utils";
import AdminLink from "../../components/AdminLink";
import { ProgressBar, ProgressStep } from "./ProgressBar.js";


function isMember(groupKey, source, sessionState, bucketState) {
  const {serverInfo: {user={}, capabilities}} = sessionState;
  if (!user.id) {
    return false;
  }
  const {signer={}} = capabilities;
  const {[groupKey]: defaultGroupName} = signer;
  const {[groupKey]: groupName=defaultGroupName} = source;
  const {id: userId} = user;
  const {groups} = bucketState;
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
  const {serverInfo: {user={}}} = sessionState;
  const {lastEditor} = source;
  return user.id === lastEditor;
}

export default class SignoffToolBar extends React.Component {
  props: {
    sessionState: SessionState,
    bucketState: BucketState,
    collectionState: CollectionState,
    signoff: SignoffState,
    requestReview: () => void,
    approveChanges: () => void,
    declineChanges: () => void,
  };

  render() {
    const {
      // Global state
      sessionState,
      bucketState,
      collectionState,
      // Plugin state
      signoff={},
      // Actions
      requestReview,
      approveChanges,
      declineChanges
    } = this.props;

    const canEdit = canEditCollection(sessionState, bucketState, collectionState);

    // The above sagas refresh the global state via `routeLoadSuccess` actions.
    // Use the global so that the toolbar is refreshed when status changes.
    const {data: {status}} = collectionState;

    // Information loaded via this plugin.
    const {resource} = signoff;
    // Hide toolbar if server has not kinto-signer plugin,
    // or if this collection is not configured to be signed.
    if (!resource) {
      return null;
    }

    const {source, preview, destination} = resource;
    const canRequestReview = canEdit && isEditor(source, sessionState, bucketState);
    const canReview = canEdit &&
                      isReviewer(source, sessionState, bucketState) &&
                      !isLastEditor(source, sessionState);
    const canSign = canEdit && isReviewer(source, sessionState, bucketState);

    // Default status is request review
    const step = status == "to-review" ? 1 : status == "signed" ? 2 : 0;
    return (
      <ProgressBar>
        <WorkInProgress
          label="Work in progress"
          step={0}
          currentStep={step}
          canEdit={canRequestReview}
          requestReview={requestReview}
          source={source} />
        <Review label="Waiting review"
          step={1}
          currentStep={step}
          canEdit={canReview}
          approveChanges={approveChanges}
          declineChanges={declineChanges}
          source={source}
          preview={preview} />
        <Signed label="Signed"
          step={2}
          currentStep={step}
          canEdit={canSign}
          reSign={approveChanges}
          source={source}
          destination={destination} />
      </ProgressBar>
    );
  }
}

function HumanDate({timestamp} : {timestamp: number}) {
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
  requestReview: () => void,
  source: SourceInfo
};

function WorkInProgress({label, canEdit, currentStep, step, requestReview, source} : WorkInProgressProps) {
  const active = step == currentStep && canEdit;
  const {lastAuthor, changes={}} = source;
  const {lastUpdated} = changes;
  return (
    <ProgressStep {...{label, currentStep, step}}>
      {lastAuthor ? <WorkInProgressInfos {...{lastAuthor, lastUpdated}}/> : null}
      {active ? <RequestReviewButton onClick={requestReview}/> : null}
    </ProgressStep>
  );
}

function WorkInProgressInfos({lastAuthor, lastUpdated}) {
  return (
    <ul>
      <li><strong>Author: </strong> {lastAuthor}</li>
      <li><strong>Updated: </strong><HumanDate timestamp={lastUpdated}/></li>
    </ul>
  );
}

function RequestReviewButton(props : Object) {
  return (
    <button className="btn btn-info" {...props}>
     <i className="glyphicon glyphicon-comment"/> Request review
    </button>
  );
}

//
// Review
//

type ReviewProps = {
  label: string,
  canEdit: boolean,
  currentStep: number,
  step: number,
  approveChanges: () => void,
  declineChanges: () => void,
  source: SourceInfo,
  preview: PreviewInfo
};

function Review({label, canEdit, currentStep, step, approveChanges, declineChanges, source, preview} : ReviewProps) {
  const active = step == currentStep && canEdit;

  // If preview disabled, the preview object is empty.
  // We use the source last status change as review request datetime.
  let link = "disabled";
  let {lastStatusChanged: lastRequested} = source;
  if (preview && preview.bid && preview.cid) {
    lastRequested = preview.lastRequested;
    const {bid, cid} = preview;
    link = <AdminLink name="collection:records" params={{bid, cid}}>{`${bid}/${cid}`}</AdminLink>;
  }

  const {lastEditor} = source;
  return (
    <ProgressStep {...{label, currentStep, step}}>
      {lastEditor ? <ReviewInfos {...{active, source, lastRequested, link}}/> : null}
      {active ? <ReviewButtons onApprove={approveChanges} onDecline={declineChanges}/> : null}
    </ProgressStep>
  );
}

type ReviewInfosProps = {
  active: boolean,
  source: SourceInfo,
  lastRequested: number,
  link: any,
};

function ReviewInfos({active, source, lastRequested, link} : ReviewInfosProps) {
  const {bid, cid, lastEditor, changes={}} = source;
  const {since, deleted, updated} = changes;
  return (
    <ul>
      <li><strong>Editor: </strong> {lastEditor}</li>
      <li><strong>Requested: </strong><HumanDate timestamp={lastRequested}/></li>
      <li><strong>Preview: </strong> {link}</li>
      {active ?
       <li>
         <strong>Changes: </strong>
         <DiffStats updated={updated} deleted={deleted}/>{" "}
         <AdminLink name="collection:history"
                    params={{bid, cid}}
                    query={{since, resource_name: "record"}}>details...</AdminLink>
       </li> : null}
    </ul>
  );
}

function DiffStats({updated, deleted} : {updated: number, deleted: number}) {
  return (
    <span className="diffstats">
      {updated > 0 ? <span className="text-green">+{updated}</span> : null}
      {deleted > 0 ? <span className="text-red">-{deleted}</span> : null}
    </span>
  );
}

function ReviewButtons({onApprove, onDecline} : {onApprove: () => void, onDecline: () => void}) {
  return (
    <div className="btn-group">
      <button className="btn btn-success"
              onClick={onApprove}>
        <i className="glyphicon glyphicon-ok"></i> Approve
      </button>
      <button className="btn btn-danger"
              onClick={onDecline}>
        <i className="glyphicon glyphicon-remove"></i> Decline
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
  destination: DestinationInfo
};

function Signed({label, canEdit, currentStep, step, reSign, source, destination} : SignedProps) {
  const active = step == currentStep && canEdit;
  const {lastReviewer} = source;
  const {lastSigned} = destination;
  return (
    <ProgressStep {...{label, currentStep, step}}>
      {lastSigned ? <SignedInfos {...{lastReviewer, destination}} /> : null}
      {active ? <ReSignButton onClick={reSign}/> : null}
    </ProgressStep>
  );
}


type SignedInfosProps = {
  lastReviewer: string,
  destination: DestinationInfo,
};

function SignedInfos({lastReviewer, destination} : SignedInfosProps) {
  const {lastSigned, bid, cid} = destination;
  return (
    <ul>
      <li><strong>Reviewer: </strong>{lastReviewer}</li>
      <li><strong>Signed: </strong><HumanDate timestamp={lastSigned}/></li>
      <li>
        <strong>Destination: </strong>
        <AdminLink name="collection:records" params={{bid, cid}}>{`${bid}/${cid}`}</AdminLink>
      </li>
    </ul>
  );
}

function ReSignButton(props: Object) {
  return (
    <button className="btn btn-info" {...props}>
      <i className="glyphicon glyphicon-repeat"></i> Re-sign
    </button>
  );
}
