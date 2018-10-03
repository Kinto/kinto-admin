import React from "react";
import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-dom/test-utils";
import { mount } from "enzyme";

import { createSandbox, createComponent } from "../test_utils";
import HomePage from "../../src/components/HomePage";
import AuthForm from "../../src/components/AuthForm";
import { DEFAULT_SERVERINFO } from "../../src/reducers/session";

describe("HomePage component", () => {
  let sandbox;
  let clock;

  beforeEach(() => {
    sandbox = createSandbox();
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
    clock.restore();
  });

  describe("Not authenticated", () => {
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
        node = createComponent(HomePage, {
          match: {},
          setupSession,
          serverChange,
          getServerInfo,
          history: ["http://server.test/v1"],
          settings: {
            singleServer: null,
          },
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
        });
      });

      it("should render a setup form", () => {
        expect(node.querySelector("form")).to.exist;
      });

      describe("Single server", () => {
        const serverURL = "http://server.test/v1";

        beforeEach(() => {
          node = createComponent(HomePage, {
            match: {},
            setupSession,
            serverChange,
            getServerInfo,
            history: [],
            settings: {
              singleServer: serverURL,
            },
            navigateToExternalAuth,
            session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
          });
        });

        it("should set the server url value in hidden field", () => {
          expect(node.querySelector("input[type='hidden']").value).eql(
            serverURL
          );
        });
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

          const ret = new Promise(setImmediate).then(() => {
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
          clock.tick();
          return ret;
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

          const ret = new Promise(setImmediate).then(() => {
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
          clock.tick();
          return ret;
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

          const ret = new Promise(setImmediate).then(() => {
            Simulate.submit(node.querySelector("form"));
            sinon.assert.calledWithExactly(navigateToExternalAuth, {
              server: "http://test.server/v1",
              authType: "fxa",
              redirectURL: undefined,
              credentials: {},
            });
          });
          clock.tick();
          return ret;
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

          const ret = new Promise(setImmediate).then(() => {
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
          clock.tick();
          return ret;
        });
      });
    });

    describe("History support", () => {
      it("should set the server field value using a default value if there's no history", () => {
        const node = createComponent(HomePage, {
          match: {},
          serverChange: sandbox.spy(),
          getServerInfo: sandbox.spy(),
          history: [],
          settings: {},
          session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
        });

        expect(node.querySelector("#root_server").value).eql(
          "https://kinto.dev.mozaws.net/v1/"
        );
      });

      it("should set the server field value using latest entry from history", () => {
        const node = createComponent(HomePage, {
          match: {},
          serverChange: sandbox.spy(),
          getServerInfo: sandbox.spy(),
          history: [{ server: "http://server.test/v1", authType: "anonymous" }],
          settings: {},
          session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
        });

        expect(node.querySelector("#root_server").value).eql(
          "http://server.test/v1"
        );
      });

      it("should set the authType field value using latest entry from history for that server", () => {
        const props = {
          match: {},
          serverChange: sandbox.spy(),
          getServerInfo: sandbox.spy(),
          history: [
            { server: "http://server.test/v1", authType: "basicauth" },
            { server: "http://test.server/v1", authType: "openid-google" },
          ],
          settings: {},
          session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
        };
        const wrapper = mount(<HomePage {...props} />);
        expect(wrapper.find("input#root_server").prop("value")).eql(
          "http://server.test/v1"
        );
        expect(wrapper.find("input#root_authType").prop("value")).eql(
          "basicauth"
        );

        // Changing the server to another element from the history.
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
        // authType is now set to the value we have from the history.
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
        createComponent(HomePage, {
          match: {
            params: {
              payload:
                "eyJzZXJ2ZXIiOiJodHRwczovL2tpbnRvLmRldi5tb3phd3MubmV0L3YxLyIsImF1dGhUeXBlIjoib3BlbmlkLWF1dGgwIiwicmVkaXJlY3RVUkwiOm51bGx9",
              token:
                "%7B%22access_token%22%3A%22oXJNgbNayWPKF%22%2C%22id_token%22%3A%22eyJ0eXAd%22%2C%22expires_in%22%3A86400%2C%22token_type%22%3A%22Bearer%22%7D",
            },
          },
          setupSession,
          serverChange: sandbox.spy(),
          getServerInfo: sandbox.spy(),
          history: [],
          settings: {},
          session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
        });
      });

      it("should setup session when component is mounted", () => {
        sinon.assert.calledWithExactly(setupSession, {
          authType: "openid-auth0",
          credentials: { token: "oXJNgbNayWPKF" },
          server: "https://kinto.dev.mozaws.net/v1/",
        });
      });
    });
  });

  describe("Authenticated", () => {
    let node;

    beforeEach(() => {
      node = createComponent(HomePage, {
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
      });
    });

    it("should render server information heading", () => {
      expect(node.querySelector(".panel-heading").textContent).eql(
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
