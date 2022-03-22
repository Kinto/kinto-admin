import sinon from "sinon";

import { createSandbox, createComponent } from "./test_utils";
import * as sessionActions from "../src/actions/session";
import { SESSION_SETUP } from "../src/constants";
import App from "../src/App";
import * as localStore from "../src/store/localStore";

describe("App", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
    localStore.clearSession();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Not authenticated", () => {
    const auth = {
      authType: "anonymous",
      server: "http://server.test/v1",
    };
    const session = {
      auth,
      buckets: [{}],
      serverInfo: {},
    };
    const createApp = () => createComponent(App, {});

    it("should call setupSession if session available", () => {
      localStore.saveSession(session);
      const setup = sandbox
        .stub(sessionActions, "setupSession")
        .returns({ type: SESSION_SETUP, auth });
      createApp();

      sinon.assert.calledWithExactly(setup, {
        authType: "anonymous",
        server: "http://server.test/v1",
      });
    });

    it("should call getServerInfo if no session", () => {
      const getServerInfo = sandbox.spy(sessionActions, "getServerInfo");
      createApp();

      sinon.assert.calledWithExactly(getServerInfo, {
        authType: "anonymous",
        server: sinon.match.string,
      });
    });
  });
});
