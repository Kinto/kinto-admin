/* @flow */
import type { SignoffState } from "./types";

import * as constants from "./constants";

const INITIAL_STATE: SignoffState = {
  collections: null,
  pendingConfirmReviewRequest: false,
  pendingConfirmDeclineChanges: false,
};

export default function signoff(
  state: SignoffState = INITIAL_STATE,
  action: Object
): SignoffState {
  switch (action.type) {
    case constants.PLUGIN_CONFIRM_REVIEW_REQUEST: {
      return { ...state, pendingConfirmReviewRequest: true };
    }
    case constants.PLUGIN_CONFIRM_DECLINE_CHANGES: {
      return { ...state, pendingConfirmDeclineChanges: true };
    }
    case constants.PLUGIN_CANCEL_PENDING_CONFIRM: {
      return {
        ...state,
        pendingConfirmReviewRequest: false,
        pendingConfirmDeclineChanges: false,
      };
    }
    case constants.SIGNOFF_WORKFLOW_INFO: {
      const { collections } = action;
      return {
        ...state,
        collections,
        pendingConfirmReviewRequest: false,
        pendingConfirmDeclineChanges: false,
      };
    }
    default: {
      return state;
    }
  }
}
