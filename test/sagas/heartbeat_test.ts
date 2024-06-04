import * as actions from "@src/actions/heartbeat";
import { heartbeatRequest } from "@src/sagas/heartbeat"; 
import { setClient } from "@src/client";
import { runSaga } from "redux-saga";

describe("Heartbeat saga", () => {
  const getState = () => ({ });
  const client = {
    execute: vi.fn(),
  };

  beforeAll(() => {
    setClient(client);
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("Should return the expected default model", async() => {
    client.execute.mockResolvedValue({});
    vi.spyOn(actions, "heartbeatResponse")
    let saga = runSaga({
      dispatch: actions.heartbeatRequest,
      getState,
    }, heartbeatRequest, null);
    expect(client.execute).toHaveBeenCalled();
    await saga.toPromise();
    expect(actions.heartbeatResponse).toHaveBeenCalledWith({
      success: true,
      response: {},
    });
  });

  it("Should return the expected state model", async() => {
    client.execute.mockResolvedValue({
      foo: true,
      bar: false,
    });
    vi.spyOn(actions, "heartbeatResponse")
    let saga = runSaga({
      dispatch: actions.heartbeatRequest,
      getState,
    }, heartbeatRequest, null);
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

  it("Should return false for success when the client throws", async() => {
    const err = new Error("throwing an error");
    client.execute.mockRejectedValue(err);
    vi.spyOn(actions, "heartbeatResponse")
    let saga = runSaga({
      dispatch: actions.heartbeatRequest,
      getState,
    }, heartbeatRequest, null);
    expect(client.execute).toHaveBeenCalled();
    await saga.toPromise();
    expect(actions.heartbeatResponse).toHaveBeenCalledWith({
      success: false,
      details: err,
    });
  });
});
