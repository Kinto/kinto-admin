import sinon from "sinon";

import { createSandbox, createComponent } from "./test_utils";
import * as sessionActions from "../src/actions/session";
import { DEFAULT_KINTO_SERVER, SESSION_SETUP } from "../src/constants";
import KintoAdmin from "../src/index";
import * as localStore from "../src/store/localStore";
import configureStore from "../src/store/configureStore";
import * as configStore from "../src/store/configureStore";
import { ANONYMOUS_AUTH } from "../src/components/AuthForm";

describe("KintoAdmin", () => {
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
    const createKintoAdmin = (settings = {}) =>
      createComponent(KintoAdmin, {
        plugins: [],
        settings,
      });

    it("should call setup with the info stored locally", () => {
      localStore.saveSession(session);
      const setup = sandbox
        .stub(sessionActions, "setupSession")
        .returns({ type: SESSION_SETUP, auth });
      createKintoAdmin();

      sinon.assert.calledWithExactly(setup, {
        authType: "anonymous",
        server: "http://server.test/v1",
      });
    });

    it("should call getServerInfo on the server if no session was stored and no servers history", () => {
      const getServerInfo = sandbox.spy(sessionActions, "getServerInfo");
      createKintoAdmin();

      sinon.assert.calledWithExactly(getServerInfo, {
        authType: "anonymous",
        server: DEFAULT_KINTO_SERVER,
      });
    });

    it("should call getServerInfo on the singleServer if set in the settings", () => {
      const getServerInfo = sandbox.spy(sessionActions, "getServerInfo");
      createKintoAdmin({ singleServer: "http://foo.bar/v1" });

      sinon.assert.calledWithExactly(getServerInfo, {
        authType: "anonymous",
        server: "http://foo.bar/v1",
      });
    });

    it("should call getServerInfo on the server from the servers history if there is one", () => {
      const getServerInfo = sandbox.spy(sessionActions, "getServerInfo");
      const store = configureStore({
        servers: [
          { server: "http://server.history/v1", authType: ANONYMOUS_AUTH },
        ],
      });
      sandbox.stub(configStore, "default").returns(store);
      createKintoAdmin();

      sinon.assert.calledWithExactly(getServerInfo, {
        authType: "anonymous",
        server: "http://server.history/v1",
      });
    });
  });
});
