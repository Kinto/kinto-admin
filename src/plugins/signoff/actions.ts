import type { CollectionsInfo } from "./types";

import * as constants from "./constants";

export function confirmRequestReview(): {
  type: "PLUGIN_CONFIRM_REVIEW_REQUEST";
} {
  return { type: constants.PLUGIN_CONFIRM_REVIEW_REQUEST };
}

export function requestReview(comment: string): {
  type: "PLUGIN_REVIEW_REQUEST";
  comment: string;
} {
  return { type: constants.PLUGIN_REVIEW_REQUEST, comment };
}

export function confirmRollbackChanges(): {
  type: "PLUGIN_CONFIRM_ROLLBACK_CHANGES";
} {
  return { type: constants.PLUGIN_CONFIRM_ROLLBACK_CHANGES };
}

export function rollbackChanges(comment: string): {
  type: "PLUGIN_ROLLBACK_CHANGES";
  comment: string;
} {
  return { type: constants.PLUGIN_ROLLBACK_CHANGES, comment };
}

export function confirmDeclineChanges(): {
  type: "PLUGIN_CONFIRM_DECLINE_CHANGES";
} {
  return { type: constants.PLUGIN_CONFIRM_DECLINE_CHANGES };
}

export function declineChanges(comment: string): {
  type: "PLUGIN_DECLINE_REQUEST";
  comment: string;
} {
  return { type: constants.PLUGIN_DECLINE_REQUEST, comment };
}

export function approveChanges(): {
  type: "PLUGIN_SIGNOFF_REQUEST";
} {
  return { type: constants.PLUGIN_SIGNOFF_REQUEST };
}

export function cancelPendingConfirm(): {
  type: "PLUGIN_CANCEL_PENDING_CONFIRM";
} {
  return { type: constants.PLUGIN_CANCEL_PENDING_CONFIRM };
}

export function workflowInfo(
  collectionsInfo: CollectionsInfo | null // called with `null` when signoff not enabled.
): {
  type: "SIGNOFF_WORKFLOW_INFO";
  collectionsInfo: CollectionsInfo | null;
} {
  return {
    type: constants.SIGNOFF_WORKFLOW_INFO,
    collectionsInfo,
  };
}
