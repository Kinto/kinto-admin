import { SERVERS_ADD, SERVERS_CLEAR } from "../constants";
import { clearServers, loadServers, saveServers } from "../store/localStore";
import type { ServerEntry } from "../types";

const INITIAL_STATE: ServerEntry[] = loadServers();

export default function servers(
  state: ServerEntry[] = INITIAL_STATE,
  action: any
): ServerEntry[] {
  switch (action.type) {
    case SERVERS_ADD: {
      const filteredHistory = state.filter(
        entry => entry.server != action.server
      );
      return saveServers(
        [{ server: action.server, authType: action.authType }].concat(
          filteredHistory
        )
      );
    }
    case SERVERS_CLEAR: {
      return clearServers();
    }
    default: {
      return state;
    }
  }
}
