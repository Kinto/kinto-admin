import * as constants from "@src/constants";
import type { SignoffState } from "@src/types";

const INITIAL_STATE: SignoffState = {
  collectionsInfo: null,
  pendingConfirmReviewRequest: false,
  pendingConfirmDeclineChanges: false,
  pendingConfirmRollbackChanges: false,
};

export default function signoff(
  state: SignoffState = INITIAL_STATE,
  action: any
): SignoffState {
  switch (action.type) {
    case constants.SIGNOFF_CONFIRM_REVIEW_REQUEST: {
      return { ...state, pendingConfirmReviewRequest: true };
    }
    case constants.SIGNOFF_CONFIRM_DECLINE_CHANGES: {
      return { ...state, pendingConfirmDeclineChanges: true };
    }
    case constants.SIGNOFF_CONFIRM_ROLLBACK_CHANGES: {
      return { ...state, pendingConfirmRollbackChanges: true };
    }
    case constants.SIGNOFF_CANCEL_PENDING_CONFIRM: {
      return {
        ...state,
        pendingConfirmReviewRequest: false,
        pendingConfirmDeclineChanges: false,
        pendingConfirmRollbackChanges: false,
      };
    }
    case constants.SIGNOFF_WORKFLOW_INFO: {
      const { collectionsInfo } = action;
      return {
        ...state,
        collectionsInfo,
        pendingConfirmReviewRequest: false,
        pendingConfirmDeclineChanges: false,
        pendingConfirmRollbackChanges: false,
      };
    }
    default: {
      return state;
    }
  }
}
