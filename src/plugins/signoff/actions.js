/* @flow */
import type { WorkflowInfo } from "./types";

import * as constants from "./constants";


export function requestReview() : {
  type: "PLUGIN_REVIEW_REQUEST",
} {
  return {type: constants.PLUGIN_REVIEW_REQUEST};
}

export function declineChanges() : {
  type: "PLUGIN_DECLINE_REQUEST",
} {
  return {type: constants.PLUGIN_DECLINE_REQUEST};
}

export function approveChanges() : {
  type: "PLUGIN_SIGNOFF_REQUEST",
} {
  return {type: constants.PLUGIN_SIGNOFF_REQUEST};
}

export function workflowInfo(info: WorkflowInfo) : {
  type: "SIGNOFF_WORKFLOW_INFO",
  info: WorkflowInfo,
} {
  return {type: constants.SIGNOFF_WORKFLOW_INFO, info};
}
