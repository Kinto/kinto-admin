/* @flow */
import type { SignoffState } from "./types";

import { SIGNOFF_WORKFLOW_INFO } from "./constants";

const INITIAL_STATE: SignoffState = {
  resource: null,
};

export default function signoff(
  state: SignoffState = INITIAL_STATE,
  action: Object
): SignoffState {
  switch (action.type) {
    case SIGNOFF_WORKFLOW_INFO: {
      const { info: { resource } } = action;
      return { ...state, resource };
    }
    default: {
      return state;
    }
  }
}
