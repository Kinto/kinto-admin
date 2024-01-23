import React from "react";
import * as localStore from "../../src/store/localStore";
import { renderWithProvider } from "../testUtils";
import { HomePage } from "../../src/components/HomePage";
import * as SessionActions from "../../src/actions/session";
import { sessionFactory } from "../testUtils";

describe("HomePage component", () => {
  afterEach(() => {
    localStore.clearSession();
  });

  describe("Authenticating", () => {
    it("loads a spinner when authenticating", async () => {
      const node = renderWithProvider(<HomePage />, {
        initialState: {
          session: sessionFactory({ authenticating: true }),
        },
      });
      expect(await node.findByTestId("spinner")).toBeDefined();
    });
  });

  describe("Not authenticated", () => {
    describe("Session setup", () => {
      it("should call setupSession if localStorage session available", () => {
        const auth = {
          authType: "anonymous",
          server: "http://server.test/v1",
        };
        const setupSession = vi.spyOn(SessionActions, "setupSession");
        localStore.saveSession({ auth });
        renderWithProvider(<HomePage />);
        expect(setupSession).toHaveBeenCalledWith(auth);
      });

      it("should call getServerInfo if no localStorage session", () => {
        const getServerInfo = vi.spyOn(SessionActions, "getServerInfo");
        renderWithProvider(<HomePage />);
        expect(getServerInfo).toHaveBeenCalledWith({
          authType: "anonymous",
          server: expect.stringMatching(/./),
        });
      });

      it("should call getServerInfo if expiresAt is in the past", () => {
        vi.useFakeTimers();
        let fakeDate = new Date(2024, 1, 2, 3, 4, 5, 6);
        vi.setSystemTime(fakeDate);
        
        const auth = {
          authType: "anonymous",
          server: "http://server.test/v1",
          expiresAt: new Date(2024, 1, 2, 3, 4, 5, 0).getTime(),
        };
        const getServerInfo = vi.spyOn(SessionActions, "getServerInfo");
        localStore.saveSession({ auth });
        renderWithProvider(<HomePage />);

        expect(getServerInfo).toHaveBeenCalled();

        vi.useRealTimers();
      });
    });

    describe("After OpenID redirection", () => {
      it("should setup session when component is mounted", () => {
        const setupSession = vi.spyOn(SessionActions, "setupSession");
        
        vi.useFakeTimers();
        let fakeDate = new Date(2024, 1, 2, 3, 4, 5, 6);
        vi.setSystemTime(fakeDate);
        
        const payload =
          "eyJzZXJ2ZXIiOiJodHRwczovL2RlbW8ua2ludG8tc3RvcmFnZS5vcmcvdjEvIiwiYXV0aFR5cGUiOiJvcGVuaWQtYXV0aDAiLCJyZWRpcmVjdFVSTCI6bnVsbH0";
        const token =
          "%7B%22access_token%22%3A%22oXJNgbNayWPKF%22%2C%22id_token%22%3A%22eyJ0eXAd%22%2C%22expires_in%22%3A86400%2C%22token_type%22%3A%22Bearer%22%7D";
        renderWithProvider(<HomePage />, {
          initialState: {
            servers: [],
          },
          route: `/auth/${payload}/${token}`,
          path: "/auth/:payload/:token",
        });

        expect(setupSession).toHaveBeenCalledWith({
          authType: "openid",
          provider: "auth0",
          tokenType: "Bearer",
          credentials: { token: "oXJNgbNayWPKF" },
          server: "https://demo.kinto-storage.org/v1/",
          expiresAt: fakeDate.getTime() + 86400 * 1000,
        });

        vi.useRealTimers();
      });
    });
  });

  describe("Authenticated", () => {
    it("should render server information heading with default info if it cannot be fetched", () => {
      const node = renderWithProvider(<HomePage />, {
        initialState: {
          session: sessionFactory({
            serverInfo: { foo: { bar: "baz" } },
            auth: { server: "foo", authType: "anonymous" },
          }),
        },
      });

      expect(node.getByText("Server information").textContent).toBeDefined();

      expect(
        [].map.call(node.getAllByTestId("home-th"), x => x.textContent)
      ).toStrictEqual(["url", "capabilities", "project_name", "project_docs"]);
    });
  });
});
