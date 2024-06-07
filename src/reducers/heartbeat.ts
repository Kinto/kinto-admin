import { HEARTBEAT_RESPONSE } from "@src/constants";
import { HeartbeatState } from "@src/types";

const INITIAL_STATE: HeartbeatState = {
  success: true,
  response: {},
};

export default function servers(
  state: HeartbeatState = INITIAL_STATE,
  action: any
): HeartbeatState {
  switch (action.type) {
    case HEARTBEAT_RESPONSE: {
      return action.response;
    }
    default: {
      return state;
    }
  }
}
