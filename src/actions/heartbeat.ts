import { HEARTBEAT_REQUEST, HEARTBEAT_RESPONSE } from "@src/constants";

export function heartbeatRequest(): {
  type: "HEARTBEAT_REQUEST";
} {
  return { type: HEARTBEAT_REQUEST };
}

export function heartbeatResponse(response: Record<string, any>): {
  type: "HEARTBEAT_RESPONSE";
  response: Record<string, any>;
} {
  return { type: HEARTBEAT_RESPONSE, response };
}
