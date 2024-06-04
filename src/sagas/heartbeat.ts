import * as actions from "@src/actions/heartbeat";
import { getClient } from "@src/client";
import { ActionType, GetStateFn, SagaGen } from "@src/types";
import { call, put } from "redux-saga/effects";

export function* heartbeatRequest(
  getState: GetStateFn,
  action: ActionType<typeof actions.heartbeatRequest>
): SagaGen {
  const response = yield call(queryHeartbeat);
  yield put(actions.heartbeatResponse(response));
}

async function queryHeartbeat(): Promise<Record<string, any>> {
  const client = getClient();

  try {
    const response: Record<string, any> = await client.execute({
      path: "/__heartbeat__",
      headers: undefined,
    });
    let success = true;
    for (let prop in response) {
      if (response[prop] === false) {
        success = false;
        break;
      }
    }
    return {
      success,
      response,
    };
  } catch (ex) {
    return {
      success: false,
      details: ex,
    };
  }
}
