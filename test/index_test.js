import sinon from "sinon";

import { createSandbox, createComponent } from "./test_utils";
import * as sessionActions from "../src/actions/session";
import { DEFAULT_KINTO_SERVER, SESSION_SETUP } from "../src/constants";
import KintoAdmin from "../src/index";
import * as localStore from "../src/store/localStore";

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
        settings: settings,
      });

    it("should call setup with the info stored locally", () => {
      localStore.saveSession(session);
      const setup = sandbox
        .stub(sessionActions, "setup")
        .returns({ type: SESSION_SETUP, auth });
      createKintoAdmin();

      sinon.assert.calledWithExactly(setup, {
        authType: "anonymous",
        server: "http://server.test/v1",
      });
    });

    it("should call getServerInfo on the server if no session was stored", () => {
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
  });
});
