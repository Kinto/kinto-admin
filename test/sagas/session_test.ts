import * as actions from "@src/actions/session";
import * as clientUtils from "@src/client";
import { getClient, resetClient, setClient } from "@src/client";
import * as notificationHooks from "@src/hooks/notifications";
import * as serversHooks from "@src/hooks/servers";
import { DEFAULT_SERVERINFO } from "@src/reducers/session";
import * as saga from "@src/sagas/session";
import { mockNotifyError, mockNotifySuccess } from "@test/testUtils";
import { call, put } from "redux-saga/effects";

const authData = {
  server: "http://server.test/v1",
  authType: "basicauth",
  credentials: {
    username: "user",
    password: "pass",
  },
};

describe("session sagas", () => {
  let notifyErrorMock, notifySuccessMock;
  beforeEach(() => {
    notifyErrorMock = mockNotifyError();
    notifySuccessMock = mockNotifySuccess();
  });

  describe("serverChange()", () => {
    let serverChange, getState;

    const serverInfo = {
      ...DEFAULT_SERVERINFO,
      url: "http://server.test/v1",
      user: {
        id: "basicauth:abcd",
      },
    };

    const sessionState = { serverInfo };

    let clearNotificationMock = vi.spyOn(
      notificationHooks,
      "clearNotifications"
    );

    beforeAll(() => {
      getState = () => ({
        session: sessionState,
      });
      serverChange = saga.serverChange(getState);
    });

    it("should reset the server info in the state and clear notifications", () => {
      expect(serverChange.next().value).toStrictEqual(
        put(actions.serverInfoSuccess(DEFAULT_SERVERINFO))
      );
      serverChange.next();
      expect(clearNotificationMock).toHaveBeenCalled();
    });
  });

  describe("getServerInfo()", () => {
    let getServerInfo, getState, action, client;

    const serverInfo = {
      ...DEFAULT_SERVERINFO,
      url: "http://server.test/v1",
      user: {
        id: "basicauth:abcd",
      },
    };

    const sessionState = { serverInfo };

    beforeAll(() => {
      resetClient();
      getState = () => ({
        session: sessionState,
      });
      action = actions.getServerInfo(authData);
      getServerInfo = saga.getServerInfo(getState, action);
    });

    describe("Success", () => {
      it("should call client.fetchServerInfo", () => {
        // ensure that sessionBusy is called
        expect(getServerInfo.next().value).toStrictEqual(
          put(actions.sessionBusy(true))
        );

        const fetchServerInfoCall = getServerInfo.next().value;
        client = getClient();
        expect(fetchServerInfoCall).toStrictEqual(
          call([client, client.fetchServerInfo])
        );
      });

      it("should have configured the client", () => {
        expect(getClient().remote).toBe(authData.server);
      });

      it("should send a serverInfoSuccess", () => {
        expect(getServerInfo.next(serverInfo).value).toMatchObject(
          put(actions.serverInfoSuccess(serverInfo))
        );
        // ensure that sessionBusy is called
        expect(getServerInfo.next().value).toStrictEqual(
          put(actions.sessionBusy(false))
        );
      });

      it("should split the auth if it's openID", () => {
        const setupClient = vi.spyOn(clientUtils, "setupClient");
        const authData = {
          server: "http://server.test/v1",
          authType: "openid-google",
          tokenType: "Bearer",
          credentials: { token: "the token" },
        };
        action = actions.getServerInfo(authData);
        getServerInfo = saga.getServerInfo(getState, action);
        getServerInfo.next();
        getServerInfo.next();
        expect(setupClient).toHaveBeenCalledWith({
          authType: "openid",
          provider: "google",
          tokenType: "Bearer",
          server: "http://server.test/v1",
          credentials: { token: "the token" },
        });
      });
    });

    describe("Failure", () => {
      it("should reset the server info", () => {
        // Make sure that we don't keep previously stored capabilities when
        // the new server fails.
        getServerInfo = saga.getServerInfo(getState, action);
        getServerInfo.next();
        getServerInfo.next();
        expect(getServerInfo.throw().value).toStrictEqual(
          put(actions.serverInfoSuccess(DEFAULT_SERVERINFO))
        );
      });

      it("should notify the error", () => {
        // ensure that sessionBusy is called
        expect(getServerInfo.next().value).toStrictEqual(
          put(actions.sessionBusy(false))
        );
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Could not reach server http://server.test/v1",
          undefined
        );
      });
    });

    describe("Race conditions", () => {
      let action1, action2, getServerInfo1, getServerInfo2;

      beforeEach(() => {
        action1 = actions.getServerInfo({
          ...authData,
          server: "http://server1/v1",
        });
        action2 = actions.getServerInfo({
          ...authData,
          server: "http://server2/v1",
        });
        getServerInfo1 = saga.getServerInfo(getState, action1);
        getServerInfo2 = saga.getServerInfo(getState, action2);
      });

      it("should ignore the success of the oldest", () => {
        getServerInfo1.next();
        getServerInfo1.next();
        getServerInfo2.next();
        getServerInfo2.next();
        // Latest to have started is getServerInfo2, it's taken into account.
        expect(getServerInfo2.next(serverInfo).value).toStrictEqual(
          put(actions.serverInfoSuccess(serverInfo))
        );
        // getServerInfo1 took longer, it's ignored.
        expect(getServerInfo1.next(serverInfo).value).not.toBeDefined();
      });

      it("should ignore the error of the oldest", () => {
        getServerInfo1.next();
        getServerInfo1.next();
        getServerInfo2.next();
        getServerInfo2.next();
        // Latest to have started is getServerInfo2, it's taken into account.
        expect(getServerInfo2.next(serverInfo).value).toStrictEqual(
          put(actions.serverInfoSuccess(serverInfo))
        );
        // getServerInfo1 took longer, it's ignored.
        expect(getServerInfo1.throw().value).not.toBeDefined();
      });
    });
  });

  describe("setupSession()", () => {
    let setupSession, getState, action;

    let serverInfo = {
      ...DEFAULT_SERVERINFO,
      url: "http://server.test/v1",
      user: {
        id: "basicauth:abcd",
      },
    };

    let sessionState = { serverInfo };

    beforeAll(() => {
      resetClient();
      getState = () => ({
        session: sessionState,
      });
      action = actions.setupSession(authData);
      setupSession = saga.setupSession(getState, action);
    });

    describe("Success", () => {
      it("should call getServerInfo", () => {
        expect(setupSession.next().value).toStrictEqual(
          call(saga.getServerInfo, getState, actions.getServerInfo(authData))
        );
      });

      it("should mark the user as authenticated", () => {
        expect(setupSession.next(serverInfo).value).toStrictEqual(
          put(actions.setAuthenticated())
        );
      });

      it("should mark the session setup as completed", () => {
        expect(setupSession.next().value).toStrictEqual(
          put(actions.setupComplete(authData))
        );
        setupSession.next();
        expect(notifySuccessMock).toBeCalledWith("Authenticated.", {
          details: ["Basic Auth"],
        });
      });

      it("should correctly authenticate the user when using openID", () => {
        vi.spyOn(serversHooks, "addServer").mockImplementation((...args) => {
          return args;
        });
        const authData = {
          server: "http://server.test/v1",
          authType: "openid-google",
          credentials: { token: "the token" },
        };
        serverInfo = {
          ...serverInfo,
          user: { id: "google:token" },
          url: "test-url",
        };
        const sessionState = { serverInfo };
        getState = () => ({
          session: sessionState,
        });

        const action = actions.setupSession(authData);
        const setupSession = saga.setupSession(getState, action);
        setupSession.next();
        expect(setupSession.next(serverInfo).value).toStrictEqual(
          put(actions.setAuthenticated())
        );
        setupSession.next();
        expect(serversHooks.addServer).toHaveBeenCalledWith(
          serverInfo.url,
          authData.authType
        );
        vi.restoreAllMocks();
      });
    });

    describe("Failure", () => {
      it("should notify authentication error", () => {
        getState = () => ({
          session: {
            serverInfo: {
              ...serverInfo,
              user: {},
            },
          },
        });
        vi.spyOn(console, "error").mockImplementation(() => {});
        setupSession = saga.setupSession(getState, action);
        setupSession.next(); // call getServerInfo.
        expect(setupSession.next().value).toStrictEqual(
          put(actions.authenticationFailed())
        );
        expect(notifyErrorMock).toHaveBeenCalledWith("Authentication failed.", {
          message: "Could not authenticate with Basic Auth",
        });
      });

      it("should check the user ID prefix for basicauth", () => {
        const authData = {
          server: "http://server.test/v1",
          authType: "accounts",
          credentials: { username: "alice", password: "secret" },
        };

        getState = () => ({
          session: {
            serverInfo: {
              ...serverInfo,
              user: { id: "basicauth:the-most-confusing-auth-ever" },
            },
          },
        });
        const action = actions.setupSession(authData);
        const setupSession = saga.setupSession(getState, action);
        setupSession.next(); // call getServerInfo.
        const mocked = mockNotifyError();
        setupSession.next();
        expect(mocked).toHaveBeenCalledWith(
          "Authentication failed.",
          expect.objectContaining({
            message: "Could not authenticate with Kinto Account Auth",
          })
        );
      });
    });
  });

  describe("sessionLogout()", () => {
    let sessionLogout;

    beforeAll(() => {
      setClient({ fake: true });
      const action = actions.logout();
      sessionLogout = saga.sessionLogout(
        () => ({ router: { location: { pathname: "/not/home" } } }),
        action
      );
    });

    it("should redirect to the homepage with a notification", () => {
      sessionLogout.next();
      expect(notifySuccessMock).toHaveBeenCalledWith("Logged out.");
    });

    it("should reset the client", () => {
      expect(() => getClient()).toThrow(Error, /not configured/);
    });
  });
});
