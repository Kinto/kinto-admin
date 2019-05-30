/* @flow */

export type CollectionsInfo = {
  source: SourceInfo,
  destination: DestinationInfo,
  preview: ?PreviewInfo,
};

export type SignoffState = {
  collectionsInfo: ?CollectionsInfo,
  pendingConfirmReviewRequest: boolean,
  pendingConfirmDeclineChanges: boolean,
};

export type ChangesList = {
  since: number,
  deleted: number,
  updated: number,
};

export type SourceInfo = {
  bid: string,
  cid: string,
  changes: ChangesList,

  lastEditBy: string,
  lastEditDate: number,
  lastReviewRequestBy: string,
  lastReviewRequestDate: number,
  lastEditorComment: string,
  lastReviewBy: string,
  lastReviewDate: number,
  lastReviewerComment: string,
  lastSignatureBy: string,
  lastSignatureDate: number,

  editors_group?: string,
  reviewers_group?: string,
};

export type PreviewInfo = {
  bid: string,
  cid: string,
};

export type DestinationInfo = {
  bid: string,
  cid: string,
};
