import { getClient } from "@src/client";
import { HeartbeatState } from "@src/types";
import { makeObservable } from "@src/utils";
import { useEffect, useState } from "react";

let state = makeObservable({
  success: true,
  response: {},
});

export function useHeartbeat(): HeartbeatState {
  const [val, setVal] = useState<HeartbeatState>(state.get());

  useEffect(() => {
    return state.subscribe(setVal);
  }, []);

  return val;
}

export async function queryHeartbeat() {
  const client = getClient();
  try {
    const response: Record<string, any> = await client.execute({
      path: "/__heartbeat__",
      headers: undefined,
    });
    const success = !Object.values(response).some(value => value === false);
    state.set({
      success,
      response,
    });
  } catch (ex) {
    state.set({
      success: false,
      details: ex,
    });
  }
}
