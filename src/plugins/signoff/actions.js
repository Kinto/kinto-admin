/* @flow */
import type { CollectionsInfo } from "./types";

import * as constants from "./constants";

export function confirmRequestReview(): {
  type: "PLUGIN_CONFIRM_REVIEW_REQUEST",
} {
  return { type: constants.PLUGIN_CONFIRM_REVIEW_REQUEST };
}

export function requestReview(
  comment: string
): {
  type: "PLUGIN_REVIEW_REQUEST",
  comment: string,
} {
  return { type: constants.PLUGIN_REVIEW_REQUEST, comment };
}

export function confirmDeclineChanges(): {
  type: "PLUGIN_CONFIRM_DECLINE_CHANGES",
} {
  return { type: constants.PLUGIN_CONFIRM_DECLINE_CHANGES };
}

export function declineChanges(
  comment: string
): {
  type: "PLUGIN_DECLINE_REQUEST",
  comment: string,
} {
  return { type: constants.PLUGIN_DECLINE_REQUEST, comment };
}

export function approveChanges(): {
  type: "PLUGIN_SIGNOFF_REQUEST",
} {
  return { type: constants.PLUGIN_SIGNOFF_REQUEST };
}

export function cancelPendingConfirm(): {
  type: "PLUGIN_CANCEL_PENDING_CONFIRM",
} {
  return { type: constants.PLUGIN_CANCEL_PENDING_CONFIRM };
}

export function workflowInfo(
  collectionsInfo: CollectionsInfo
): {
  type: "SIGNOFF_WORKFLOW_INFO",
  collectionsInfo: CollectionsInfo,
} {
  return {
    type: constants.SIGNOFF_WORKFLOW_INFO,
    collectionsInfo,
  };
}
