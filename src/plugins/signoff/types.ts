export type CollectionsInfo = {
  source: SourceInfo;
  destination: DestinationInfo;
  preview: PreviewInfo | null | undefined;
  // List of changes, present or absent depending on status.
  // If work-in-progress, show changes since the last review request. It will be
  // null if no changes were made.
  changesOnSource?: ChangesList | null | undefined;
  // If to-review, show changes since the last approval. It will be null if no
  // changes were made.
  changesOnPreview?: ChangesList | null | undefined;
};

export type SignoffState = {
  collectionsInfo: CollectionsInfo | null | undefined;
  pendingConfirmReviewRequest: boolean;
  pendingConfirmDeclineChanges: boolean;
  pendingConfirmRollbackChanges: boolean;
};

export type ChangesList = {
  since: number;
  deleted: number;
  updated: number;
};

export type CollectionStatus =
  | "signed"
  | "to-review"
  | "to-rollback"
  | "to-sign"
  | "work-in-progress";

export type SourceInfo = {
  // Basic Info (before loading from info server)
  bid: string;
  cid: string;
  // Full info.
  status?: CollectionStatus;
  lastEditBy?: string;
  lastEditDate?: number;
  lastReviewRequestBy?: string;
  lastReviewRequestDate?: number;
  lastEditorComment?: string;
  lastReviewBy?: string;
  lastReviewDate?: number;
  lastReviewerComment?: string;
  lastSignatureBy?: string;
  lastSignatureDate?: number;
  editors_group?: string;
  reviewers_group?: string;
};

export type PreviewInfo = {
  bid: string;
  cid: string;
};

export type DestinationInfo = {
  bid: string;
  cid: string;
};
