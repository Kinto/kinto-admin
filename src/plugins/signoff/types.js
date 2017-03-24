/* @flow */
export type SignoffState = {
  source: ?SourceInfo,
  preview: ?PreviewInfo,
  destination: ?DestinationInfo,
  pendingConfirmReviewRequest: boolean,
  pendingConfirmDeclineChanges: boolean,
};

export type SourceInfo = {
  bid: string,
  cid: string,
  changes: Object,
  lastAuthor: string,
  lastEditor: string,
  lastEditorComment: string,
  lastReviewer: string,
  lastReviewerComment: string,
  lastStatusChanged: number,
  editors_group?: string,
  reviewers_group?: string,
};

export type PreviewInfo = {
  bid: string,
  cid: string,
  lastRequested: number,
};

export type DestinationInfo = {
  bid: string,
  cid: string,
  lastSigned: number,
};
