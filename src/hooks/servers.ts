import { useLocalStorage } from "./storage";
import { ANONYMOUS_AUTH } from "@src/constants";
import type { ServerEntry } from "@src/types";

export const SERVER_HISTORY_KEY = "kinto-admin-server-history";

export function useServerHistory() {
  const [storedServerHistory, setServerHistory] = useLocalStorage(
    SERVER_HISTORY_KEY,
    []
  );
  const historyEntries = Array.isArray(storedServerHistory)
    ? storedServerHistory
    : [];
  // Cope with legacy history which only stored the server as a string, without the authType.
  const serverHistory: ServerEntry[] = historyEntries.map(entry =>
    typeof entry === "string"
      ? { server: entry, authType: ANONYMOUS_AUTH }
      : entry
  );

  const addServerToHistory = (server: string, authType: string) => {
    setServerHistory([
      { server, authType },
      ...serverHistory.filter(entry => entry.server != server),
    ]);
  };

  const clearServerHistory = () => setServerHistory([]);

  return { serverHistory, addServerToHistory, clearServerHistory };
}
