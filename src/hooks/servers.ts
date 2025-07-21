import { clearServers, loadServers, saveServers } from "@src/store/localStore";
import { ServerEntry } from "@src/types";
import { makeObservable } from "@src/utils";
import { useEffect, useState } from "react";

const state = makeObservable(loadServers());

export function useServers(): ServerEntry[] {
  const [val, setVal] = useState<ServerEntry[]>(state.get());

  useEffect(() => {
    return state.subscribe(setVal);
  }, []);

  return val;
}

export function addServer(server: string, authType: string) {
  const servers = [...state.get()];
  const filteredHistory = servers.filter(entry => entry.server != server);

  const history = saveServers(
    [{ server: server, authType: authType }].concat(filteredHistory)
  );

  state.set(history);
}

export function clearServersHistory() {
  clearServers();
  state.set([]);
}
