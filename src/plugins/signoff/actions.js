/* @flow */
import type { Action } from "../../types";
import type { WorkflowInfo } from "./types";

import * as constants from "./constants";


export function requestReview() : Action {
  return {type: constants.PLUGIN_REVIEW_REQUEST};
}

export function declineChanges() : Action {
  return {type: constants.PLUGIN_DECLINE_REQUEST};
}

export function approveChanges() : Action {
  return {type: constants.PLUGIN_SIGNOFF_REQUEST};
}

export function workflowInfo(info : WorkflowInfo) : Action {
  return {type: constants.SIGNOFF_WORKFLOW_INFO, info};
}
