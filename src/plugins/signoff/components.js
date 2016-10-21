/* @flow */
import type { BucketState, SessionState, CollectionState } from "../../types";
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
      declineChanges} = this.props;

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

    // Default status is request review
    const step = status == "to-review" ? 1 : status == "signed" ? 2 : 0;
    return (
      <ProgressBar>
        <WorkInProgress label="Work in progress"
                        step={0}
                        currentStep={step}
                        canEdit={canEdit}
                        requestReview={requestReview}
                        source={source} />
        <Review label="Waiting review"
                step={1}
                currentStep={step}
                canEdit={canEdit}
                approveChanges={approveChanges}
                declineChanges={declineChanges}
                source={source}
                preview={preview} />
        <Signed label="Signed"
                step={2}
                currentStep={step}
                canEdit={canEdit}
                reSign={approveChanges}
                source={source}
                destination={destination} />
      </ProgressBar>
    );
  }
}

function WorkInProgress({label,
                         canEdit,
                         currentStep,
                         step,
                         requestReview,
                         source} : {label: string,
                                    canEdit: boolean,
                                    currentStep: number,
                                    step: number,
                                    requestReview: () => void,
                                    source: SourceInfo}) {
  const active = (step == currentStep && canEdit);
  const {lastAuthor, changes={}} = source;
  const {lastUpdated} = changes;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {lastAuthor ?
       <ul>
         <li><strong>Author: </strong> {lastAuthor}</li>
         <li><strong>Updated: </strong><span title={humanDate(lastUpdated)}>{timeago(lastUpdated)}</span></li>
       </ul> : null}
      {active ?
       <button className="btn btn-info"
               onClick={requestReview}>
        <i className="glyphicon glyphicon-comment"></i> Request review
       </button> : null}
    </ProgressStep>
  );
}

function Review({label,
                 canEdit,
                 currentStep,
                 step,
                 approveChanges,
                 declineChanges,
                 source,
                 preview} : {label: string,
                             canEdit: boolean,
                             currentStep: number,
                             step: number,
                             approveChanges: () => void,
                             declineChanges: () => void,
                             source: SourceInfo,
                             preview: PreviewInfo}) {
  const active = (step == currentStep && canEdit);

  // If preview disabled, the preview object is empty.
  // We use the source last status change as review request datetime.
  let link = "disabled";
  let {lastStatusChanged: lastRequested} = source;
  if (preview.bid && preview.cid) {
    lastRequested = preview.lastRequested;
    const {bid, cid} = preview;
    link = <AdminLink name="collection:records" params={{bid, cid}}>{`${bid}/${cid}`}</AdminLink>;
  }

  const {bid, cid, lastEditor, changes={}} = source;
  const {since, deleted, updated} = changes;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {lastEditor ?
       <ul>
         <li><strong>Editor: </strong> {lastEditor}</li>
         <li><strong>Requested: </strong><span title={humanDate(lastRequested)}>{timeago(lastRequested)}</span></li>
         <li><strong>Preview: </strong> {link}</li>
         {active ?
          <li>
            <strong>Changes: </strong>
            <DiffStats updated={updated} deleted={deleted}/>{" "}
            <AdminLink name="collection:history"
                       params={{bid, cid}}
                       query={{since, resource_name: "record"}}>details...</AdminLink>
          </li> : null}
       </ul> : null}
      {active ?
       <div className="btn-group">
         <button className="btn btn-success"
                 onClick={approveChanges}>
           <i className="glyphicon glyphicon-ok"></i> Approve
         </button>
         <button className="btn btn-danger"
                 onClick={declineChanges}>
           <i className="glyphicon glyphicon-remove"></i> Decline
         </button>
       </div> : null}
    </ProgressStep>
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

function Signed({label,
                 canEdit,
                 currentStep,
                 step,
                 reSign,
                 source,
                 destination} : {label: string,
                                 canEdit: boolean,
                                 currentStep: number,
                                 step: number,
                                 reSign: () => void,
                                 source: SourceInfo,
                                 destination: DestinationInfo}) {
  const active = (step == currentStep && canEdit);
  const {lastReviewer} = source;
  const {lastSigned, bid, cid} = destination;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {lastSigned ?
       <ul>
         <li><strong>Reviewer: </strong>{lastReviewer}</li>
         <li><strong>Signed: </strong><span title={humanDate(lastSigned)}>{timeago(lastSigned)}</span></li>
         <li>
           <strong>Destination: </strong>
           <AdminLink name="collection:records" params={{bid, cid}}>{`${bid}/${cid}`}</AdminLink>
         </li>
      </ul> : null}
      {active ?
       <button className="btn btn-info"
               onClick={reSign}>
         <i className="glyphicon glyphicon-repeat"></i> Re-sign
       </button> : null}
    </ProgressStep>
  );
}
