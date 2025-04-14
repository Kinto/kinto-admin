import { clearServers, loadServers, saveServers } from "@src/store/localStore";
import { ServerEntry } from "@src/types";
import { makeObservable } from "@src/utils";
import { useEffect, useState } from "react";

let state = makeObservable(loadServers());

export function useServers(): ServerEntry[] {
  const [val, setVal] = useState<ServerEntry[]>(state.get());

  useEffect(() => {
    return state.subscribe(setVal);
  }, []);

  return val;
}

export function addServer(server: string, authType: string) {
  let servers = [...state.get()];
  let filteredHistory = servers.filter(entry => entry.server != server);

  let history = saveServers(
    [{ server: server, authType: authType }].concat(filteredHistory)
  );

  state.set(history);
}

export function clearServersHistory() {
  clearServers();
  state.set([]);
}
