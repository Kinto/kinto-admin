/* @flow */
export type SignoffState = {
  resource: WorkflowInfo
};

export type WorkflowInfo = {
  source: SourceInfo,
  preview: PreviewInfo,
  destination: DestinationInfo,
};

export type SourceInfo = {
  bid: string,
  cid: string,
  changes: Object,
  lastAuthor: string,
  lastEditor: string,
  lastReviewer: string,
  lastStatusChanged: number,
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
