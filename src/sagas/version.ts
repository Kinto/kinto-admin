import * as actions from "@src/actions/version";
import { getClient } from "@src/client";
import { ActionType, GetStateFn, SagaGen } from "@src/types";
import { call, put } from "redux-saga/effects";

export function* versionRequest(
  getState: GetStateFn,
  action: ActionType<typeof actions.versionRequest>
): SagaGen {
  const response = yield call(getVersion);
  yield put(actions.versionResponse(response));
}

async function getVersion(): Promise<Record<string, string>> {
  const client = getClient();

  try {
    const response: Record<string, string> = await client.execute({
      path: "/__version__",
      headers: undefined,
    });
    return response;
  } catch (ex) {
    console.error(ex); // do actual error alerting
  }
}
