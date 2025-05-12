import * as sessionActions from "@src/actions/session";
import * as sessionSagas from "@src/sagas/session";
import { configureAppStore } from "@src/store/configureStore";

function expectSagaCalled(saga, action) {
  // Note: the rootSaga function is called by configureStore
  const { store } = configureAppStore();
  store.dispatch(action);
  expect(saga.mock.calls[0][0].name).toBe("bound getState");
  expect(saga.mock.calls[0][1]).toStrictEqual(action);
}

describe("root saga", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  beforeEach(() => {
    // To match the behavior of older versions of redux-saga, we're ignoring
    // calls to console.error from these tests.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("Session watchers registration", () => {
    it("should watch for the setup action", () => {
      const saga = vi.spyOn(sessionSagas, "setupSession");
      const action = sessionActions.setupSession();

      expectSagaCalled(saga, action);
    });

    it("should watch for the listBuckets action", () => {
      const saga = vi.spyOn(sessionSagas, "listBuckets");
      const action = sessionActions.listBuckets();

      expectSagaCalled(saga, action);
    });
  });
});
