import { SERVERS_ADD, SERVERS_CLEAR } from "../constants";

export function addServer(
  server: string,
  authType: string
): {
  type: "SERVERS_ADD";
  server: string;
  authType: string;
} {
  return { type: SERVERS_ADD, server, authType };
}

export function clearServers(): {
  type: "SERVERS_CLEAR";
} {
  return { type: SERVERS_CLEAR };
}
