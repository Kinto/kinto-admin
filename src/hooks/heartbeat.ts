import { getClient } from "@src/client";
import { HeartbeatState } from "@src/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useHeartbeat(): HeartbeatState {
  const [val, setVal] = useState<HeartbeatState>({
    success: true,
    response: {},
  });

  useEffect(() => {
    queryHeartbeat(setVal);
  }, []);

  return val;
}

async function queryHeartbeat(
  setVal: Dispatch<SetStateAction<HeartbeatState>>
) {
  const client = getClient();
  try {
    const response: Record<string, any> = await client.execute({
      path: "/__heartbeat__",
      headers: undefined,
    });
    const success = !Object.values(response).some(value => value === false);
    setVal({
      success,
      response,
    });
  } catch (ex) {
    setVal({
      success: false,
      details: ex,
    });
  }
  setTimeout(() => {
    queryHeartbeat(setVal);
  }, 60000);
}
