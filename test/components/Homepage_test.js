import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-addons-test-utils";

import { createSandbox, createComponent } from "../test_utils";
import HomePage from "../../src/components/HomePage";
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
      let node, setup, getServerInfo, navigateToExternalAuth, serverChange;

      beforeEach(() => {
        setup = sandbox.spy();
        serverChange = sandbox.spy();
        getServerInfo = sandbox.spy();
        navigateToExternalAuth = sandbox.spy();
        node = createComponent(HomePage, {
          setup,
          serverChange,
          getServerInfo,
          history: ["http://server.test/v1"],
          settings: {
            singleServer: null,
          },
          navigateToExternalAuth,
          session: {
            authenticated: false,
            serverInfo: {
              capabilities: {
                basicauth: "some basic auth info",
                ldap: "some ldap auth info",
                fxa: "some fxa auth info",
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
            setup,
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
          clock.tick(500); // The AuthForm.onChange even is debounced.
          Simulate.change(node.querySelector("#root_credentials_username"), {
            target: { value: "user" },
          });
          Simulate.change(node.querySelector("#root_credentials_password"), {
            target: { value: "pass" },
          });

          return new Promise(setImmediate).then(() => {
            Simulate.submit(node.querySelector("form"));
            sinon.assert.calledWithExactly(setup, {
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

          return new Promise(setImmediate).then(() => {
            Simulate.submit(node.querySelector("form"));
            sinon.assert.calledWithExactly(setup, {
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
      });

      describe("FxA", () => {
        it("should navigate to external auth URL", () => {
          Simulate.change(node.querySelector("#root_server"), {
            target: { value: "http://test.server/v1" },
          });
          Simulate.change(node.querySelectorAll("[type=radio]")[2], {
            target: { value: "fxa" },
          });

          return new Promise(setImmediate).then(() => {
            Simulate.submit(node.querySelector("form"));
            sinon.assert.calledWithExactly(navigateToExternalAuth, {
              server: "http://test.server/v1",
              authType: "fxa",
              redirectURL: undefined,
            });
          });
        });
      });
    });

    describe("History support", () => {
      it("should set the server field value using latest entry from history", () => {
        const node = createComponent(HomePage, {
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
          serverChange: sandbox.spy(),
          getServerInfo: sandbox.spy(),
          history: ["http://server.test/v1"],
          settings: {},
          session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
        });

        expect(node.querySelector("#root_server").value).eql(
          "http://server.test/v1"
        );
      });
    });
  });

  describe("Authenticated", () => {
    let node;

    beforeEach(() => {
      node = createComponent(HomePage, {
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
