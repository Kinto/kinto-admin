import React from "react";
import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-dom/test-utils";
import { mount } from "enzyme";

import * as localStore from "../../src/store/localStore";
import { createSandbox, createComponent } from "../test_utils";
import HomePage from "../../src/components/HomePage";
import AuthForm from "../../src/components/AuthForm";
import { DEFAULT_SERVERINFO } from "../../src/reducers/session";

describe("HomePage component", () => {
  let sandbox;
  let clock;

  beforeEach(() => {
    sandbox = createSandbox();
    localStore.clearSession();
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
    clock.restore();
  });

  describe("Not authenticated", () => {
    describe("Session setup", () => {
      let setupSession,
        getServerInfo,
        navigateToExternalAuth,
        navigateToOpenID,
        serverChange,
        props;

      const auth = {
        authType: "anonymous",
        server: "http://server.test/v1",
      };
      const session = {
        auth,
        buckets: [{}],
        serverInfo: {
          capabilities: {
            basicauth: "some basic auth info",
            ldap: "some ldap auth info",
            fxa: "some fxa auth info",
            openid: {
              providers: [
                {
                  name: "google",
                },
              ],
            },
          },
        },
      };
      beforeEach(() => {
        setupSession = sandbox.spy();
        serverChange = sandbox.spy();
        getServerInfo = sandbox.spy();
        navigateToExternalAuth = sandbox.spy();
        navigateToOpenID = sandbox.spy();
        props = {
          match: {},
          setupSession,
          serverChange,
          getServerInfo,
          servers: ["http://server.test/v1"],
          navigateToExternalAuth,
          navigateToOpenID,
          session,
        };
      });
      it("should call setupSession if localStorage session available", () => {
        localStore.saveSession(session);
        createComponent(<HomePage {...props} />);
        sinon.assert.calledWithExactly(setupSession, {
          authType: "anonymous",
          server: "http://server.test/v1",
        });
      });

      it("should call getServerInfo if no localStorage session", () => {
        createComponent(<HomePage {...props} />);
        sinon.assert.calledWithExactly(getServerInfo, {
          authType: "anonymous",
          server: sinon.match.string,
        });
      });
    });

    describe("Authentication types", () => {
      let node,
        setupSession,
        getServerInfo,
        navigateToExternalAuth,
        navigateToOpenID,
        serverChange;

      beforeEach(() => {
        setupSession = sandbox.spy();
        serverChange = sandbox.spy();
        getServerInfo = sandbox.spy();
        navigateToExternalAuth = sandbox.spy();
        navigateToOpenID = sandbox.spy();
        const props = {
          match: {},
          setupSession,
          serverChange,
          getServerInfo,
          servers: ["http://server.test/v1"],
          navigateToExternalAuth,
          navigateToOpenID,
          session: {
            authenticated: false,
            serverInfo: {
              capabilities: {
                basicauth: "some basic auth info",
                ldap: "some ldap auth info",
                fxa: "some fxa auth info",
                openid: {
                  providers: [
                    {
                      name: "google",
                    },
                  ],
                },
              },
            },
          },
        };
        node = createComponent(<HomePage {...props} />);
      });

      it("should render a setup form", () => {
        expect(node.querySelector("form")).to.exist;
      });

      describe("Basic Auth", () => {
        it("should submit setup data", () => {
          Simulate.change(node.querySelector("#root_server"), {
            target: { value: "http://test.server/v1" },
          });
          Simulate.change(node.querySelectorAll("[type=radio]")[1], {
            target: { value: "basicauth" },
          });
          clock.tick(500); // The server field .onChange even is debounced.
          Simulate.change(node.querySelector("#root_credentials_username"), {
            target: { value: "user" },
          });
          Simulate.change(node.querySelector("#root_credentials_password"), {
            target: { value: "pass" },
          });

          Simulate.submit(node.querySelector("form"));
          sinon.assert.calledWithExactly(setupSession, {
            server: "http://test.server/v1",
            authType: "basicauth",
            credentials: {
              username: "user",
              password: "pass",
            },
            redirectURL: undefined,
          });
        });
      });

      describe("LDAP", () => {
        it("should submit setup data", () => {
          Simulate.change(node.querySelector("#root_server"), {
            target: { value: "http://test.server/v1" },
          });
          Simulate.change(node.querySelectorAll("[type=radio]")[3], {
            target: { value: "ldap" },
          });
          clock.tick(500); // The AuthForm.onChange even is debounced.
          Simulate.change(node.querySelector("#root_credentials_username"), {
            target: { value: "you@email.com" },
          });
          Simulate.change(node.querySelector("#root_credentials_password"), {
            target: { value: "pass" },
          });
          Simulate.submit(node.querySelector("form"));
          sinon.assert.calledWithExactly(setupSession, {
            server: "http://test.server/v1",
            authType: "ldap",
            credentials: {
              username: "you@email.com",
              password: "pass",
            },
            redirectURL: undefined,
          });
        });
      });

      describe("FxA", () => {
        it("should navigate to external auth URL", () => {
          Simulate.change(node.querySelector("#root_server"), {
            target: { value: "http://test.server/v1" },
          });
          Simulate.change(node.querySelectorAll("[type=radio]")[2], {
            target: { value: "fxa" },
          });

          Simulate.submit(node.querySelector("form"));
          sinon.assert.calledWithExactly(navigateToExternalAuth, {
            server: "http://test.server/v1",
            authType: "fxa",
            redirectURL: undefined,
            credentials: {},
          });
        });
      });

      describe("OpenID", () => {
        it("should navigate to external auth URL", () => {
          Simulate.change(node.querySelector("#root_server"), {
            target: { value: "http://test.server/v1" },
          });
          Simulate.change(node.querySelectorAll("[type=radio]")[4], {
            target: { value: "openid-google" },
          });
          Simulate.submit(node.querySelector("form"));
          sinon.assert.calledWithExactly(
            navigateToOpenID,
            {
              server: "http://test.server/v1",
              redirectURL: undefined,
              authType: "openid-google",
            },
            { name: "google" }
          );
        });
      });
    });

    describe("Servers history support", () => {
      it("should set the server field value using a default value if there's no servers", () => {
        const props = {
          match: {},
          serverChange: sandbox.spy(),
          getServerInfo: sandbox.spy(),
          servers: [],
          session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
        };
        const node = createComponent(<HomePage {...props} />);

        expect(node.querySelector("#root_server").value).eql(
          "https://demo.kinto-storage.org/v1/"
        );
      });

      it("should set the server field value using latest entry from servers", () => {
        const props = {
          match: {},
          serverChange: sandbox.spy(),
          getServerInfo: sandbox.spy(),
          servers: [{ server: "http://server.test/v1", authType: "anonymous" }],
          session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
        };
        const node = createComponent(<HomePage {...props} />);

        expect(node.querySelector("#root_server").value).eql(
          "http://server.test/v1"
        );
      });

      it("should set the authType field value using latest entry from servers history for that server", () => {
        const props = {
          match: {},
          serverChange: sandbox.spy(),
          getServerInfo: sandbox.spy(),
          servers: [
            { server: "http://server.test/v1", authType: "basicauth" },
            { server: "http://test.server/v1", authType: "openid-google" },
          ],
          session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
        };
        const wrapper = mount(<HomePage {...props} />);
        expect(wrapper.find("input#root_server").prop("value")).eql(
          "http://server.test/v1"
        );
        expect(wrapper.find("input#root_authType").prop("value")).eql(
          "basicauth"
        );

        // Changing the server to another element from the servers history.
        wrapper.find("input#root_server").simulate("change", {
          target: { value: "http://test.server/v1" },
        });
        expect(wrapper.find("input#root_server").prop("value")).eql(
          "http://test.server/v1"
        );
        // authType is reset to "anonymous" while we wait for the server info
        // (capabilities)
        expect(wrapper.find("input#root_authType").prop("value")).eql(
          "anonymous"
        );

        // Simulate a `getServerInfo` response that updated the `capabilities`.
        const prevProps = wrapper.props();
        wrapper.setProps({
          ...prevProps,
          session: {
            ...prevProps.session,
            serverInfo: {
              ...prevProps.session.serverInfo,
              capabilities: {
                ...prevProps.session.serverInfo.capabilities,
                basicauth: "some basic auth info",
                ldap: "some ldap auth info",
                fxa: "some fxa auth info",
                openid: {
                  providers: [
                    {
                      name: "google",
                    },
                  ],
                },
              },
            },
          },
        });
        // authType is now set to the value we have from the servers history.
        // TODO: for some reason, we don't have a "input#root_authType" anymore
        // at this point, so we need to get at the `authType` value some other
        // way, here by looking into the state.
        const state = wrapper.find(AuthForm).instance().state;
        expect(state.formData.authType).eql("openid-google");
      });
    });

    describe("After OpenID redirection", () => {
      let setupSession;

      beforeEach(() => {
        setupSession = sinon.spy();
        const props = {
          match: {
            params: {
              payload:
                "eyJzZXJ2ZXIiOiJodHRwczovL2RlbW8ua2ludG8tc3RvcmFnZS5vcmcvdjEvIiwiYXV0aFR5cGUiOiJvcGVuaWQtYXV0aDAiLCJyZWRpcmVjdFVSTCI6bnVsbH0",
              token:
                "%7B%22access_token%22%3A%22oXJNgbNayWPKF%22%2C%22id_token%22%3A%22eyJ0eXAd%22%2C%22expires_in%22%3A86400%2C%22token_type%22%3A%22Bearer%22%7D",
            },
          },
          setupSession,
          serverChange: sandbox.spy(),
          getServerInfo: sandbox.spy(),
          servers: [],
          session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
        };
        createComponent(<HomePage {...props} />);
      });

      it("should setup session when component is mounted", () => {
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
    let node, getServerInfo;

    beforeEach(() => {
      getServerInfo = sandbox.spy();
      const props = {
        match: {},
        session: {
          authenticated: true,
          server: "http://test.server/v1",
          username: "user",
          password: "pass",
          serverInfo: {
            foo: {
              bar: "plop",
            },
          },
        },
        getServerInfo,
      };
      node = createComponent(<HomePage {...props} />);
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
