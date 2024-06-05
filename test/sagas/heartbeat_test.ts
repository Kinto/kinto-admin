import * as actions from "@src/actions/heartbeat";
import { setClient } from "@src/client";
import { heartbeatRequest } from "@src/sagas/heartbeat";
import { runSaga } from "redux-saga";

describe("Heartbeat saga", () => {
  const getState = () => ({});
  const client = {
    execute: vi.fn(),
  };

  beforeAll(() => {
    setClient(client);
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(actions, "heartbeatResponse");
  });

  it("Should return the expected default model", async () => {
    client.execute.mockResolvedValue({});
    let saga = runSaga(
      {
        dispatch: actions.heartbeatRequest,
        getState,
      },
      heartbeatRequest,
      null
    );
    expect(client.execute).toHaveBeenCalled();
    await saga.toPromise();
    expect(actions.heartbeatResponse).toHaveBeenCalledWith({
      success: true,
      response: {},
    });
  });

  it("Should return the expected state model", async () => {
    client.execute.mockResolvedValue({
      foo: true,
      bar: false,
    });
    let saga = runSaga(
      {
        dispatch: actions.heartbeatRequest,
        getState,
      },
      heartbeatRequest,
      null
    );
    expect(client.execute).toHaveBeenCalled();
    await saga.toPromise();
    expect(actions.heartbeatResponse).toHaveBeenCalledWith({
      success: false,
      response: {
        foo: true,
        bar: false,
      },
    });
  });

  it("Should return false for success when the client throws", async () => {
    const err = new Error("throwing an error");
    client.execute.mockRejectedValue(err);
    let saga = runSaga(
      {
        dispatch: actions.heartbeatRequest,
        getState,
      },
      heartbeatRequest,
      null
    );
    expect(client.execute).toHaveBeenCalled();
    await saga.toPromise();
    expect(actions.heartbeatResponse).toHaveBeenCalledWith({
      success: false,
      details: err,
    });
  });
});
