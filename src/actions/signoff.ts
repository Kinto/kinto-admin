import * as constants from "../constants";
import type { SignoffCollectionsInfo } from "../types";

export function confirmRequestReview(): {
  type: "SIGNOFF_CONFIRM_REVIEW_REQUEST";
} {
  return { type: constants.SIGNOFF_CONFIRM_REVIEW_REQUEST };
}

export function requestReview(comment: string): {
  type: "SIGNOFF_REVIEW_REQUEST";
  comment: string;
} {
  return { type: constants.SIGNOFF_REVIEW_REQUEST, comment };
}

export function confirmRollbackChanges(): {
  type: "SIGNOFF_CONFIRM_ROLLBACK_CHANGES";
} {
  return { type: constants.SIGNOFF_CONFIRM_ROLLBACK_CHANGES };
}

export function rollbackChanges(comment: string): {
  type: "SIGNOFF_ROLLBACK_CHANGES";
  comment: string;
} {
  return { type: constants.SIGNOFF_ROLLBACK_CHANGES, comment };
}

export function confirmDeclineChanges(): {
  type: "SIGNOFF_CONFIRM_DECLINE_CHANGES";
} {
  return { type: constants.SIGNOFF_CONFIRM_DECLINE_CHANGES };
}

export function declineChanges(comment: string): {
  type: "SIGNOFF_DECLINE_REQUEST";
  comment: string;
} {
  return { type: constants.SIGNOFF_DECLINE_REQUEST, comment };
}

export function approveChanges(): {
  type: "SIGNOFF_SIGNOFF_REQUEST";
} {
  return { type: constants.SIGNOFF_SIGNOFF_REQUEST };
}

export function cancelPendingConfirm(): {
  type: "SIGNOFF_CANCEL_PENDING_CONFIRM";
} {
  return { type: constants.SIGNOFF_CANCEL_PENDING_CONFIRM };
}

export function workflowInfo(
  collectionsInfo: SignoffCollectionsInfo | null // called with `null` when signoff not enabled.
): {
  type: "SIGNOFF_WORKFLOW_INFO";
  collectionsInfo: SignoffCollectionsInfo | null;
} {
  return {
    type: constants.SIGNOFF_WORKFLOW_INFO,
    collectionsInfo,
  };
}
