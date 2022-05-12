import React from "react";
import { expect } from "chai";
import sinon from "sinon";

import * as localStore from "../../src/store/localStore";
import { createSandbox, createComponent } from "../test_utils";
import { HomePage } from "../../src/components/HomePage";
import * as SessionActions from "../../src/actions/session";
import { sessionFactory } from "../test_utils";

describe("HomePage component", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    localStore.clearSession();
  });

  describe("Not authenticated", () => {
    describe("Session setup", () => {
      it("should call setupSession if localStorage session available", () => {
        const auth = {
          authType: "anonymous",
          server: "http://server.test/v1",
        };
        const setupSession = sandbox.spy(SessionActions, "setupSession");
        localStore.saveSession({ auth });
        createComponent(<HomePage />);
        sinon.assert.calledWithExactly(setupSession, auth);
      });

      it("should call getServerInfo if no localStorage session", () => {
        const getServerInfo = sandbox.spy(SessionActions, "getServerInfo");
        createComponent(<HomePage />);
        sinon.assert.calledWithExactly(getServerInfo, {
          authType: "anonymous",
          server: sinon.match.string,
        });
      });
    });

    describe("After OpenID redirection", () => {
      it("should setup session when component is mounted", () => {
        const setupSession = sandbox.spy(SessionActions, "setupSession");
        const payload =
          "eyJzZXJ2ZXIiOiJodHRwczovL2RlbW8ua2ludG8tc3RvcmFnZS5vcmcvdjEvIiwiYXV0aFR5cGUiOiJvcGVuaWQtYXV0aDAiLCJyZWRpcmVjdFVSTCI6bnVsbH0";
        const token =
          "%7B%22access_token%22%3A%22oXJNgbNayWPKF%22%2C%22id_token%22%3A%22eyJ0eXAd%22%2C%22expires_in%22%3A86400%2C%22token_type%22%3A%22Bearer%22%7D";
        createComponent(<HomePage />, {
          initialState: {
            servers: [],
          },
          route: `/auth/${payload}/${token}`,
          path: "/auth/:payload/:token",
        });

        sinon.assert.calledWithExactly(setupSession, {
          authType: "openid",
          provider: "auth0",
          tokenType: "Bearer",
          credentials: { token: "oXJNgbNayWPKF" },
          server: "https://demo.kinto-storage.org/v1/",
        });
      });
    });
  });

  describe("Authenticated", () => {
    let node;

    beforeAll(() => {
      node = createComponent(<HomePage />, {
        initialState: {
          session: sessionFactory({ serverInfo: { foo: { bar: "baz" } } }),
        },
      });
    });

    it("should render server information heading", () => {
      expect(node.querySelector(".card-header").textContent).eql(
        "Server information"
      );
    });

    it("should render server information table", () => {
      expect([].map.call(node.querySelectorAll("th"), x => x.textContent)).eql([
        "foo",
        "bar",
      ]);
    });
  });
});
