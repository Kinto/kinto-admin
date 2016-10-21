import * as constants from "./constants";

export function requestReview() {
  return {type: constants.PLUGIN_REVIEW_REQUEST};
}

export function declineChanges() {
  return {type: constants.PLUGIN_DECLINE_REQUEST};
}

export function approveChanges() {
  return {type: constants.PLUGIN_SIGNOFF_REQUEST};
}

export function workflowInfo(info) {
  return {type: constants.SIGNOFF_WORKFLOW_INFO, info};
}
