import { createSandbox, createComponent } from "../test_utils";
import { DEFAULT_KINTO_SERVER } from "../../src/constants";
import { DEFAULT_SERVERINFO } from "../../src/reducers/session";
import { expect } from "chai";
import { render, fireEvent } from "@testing-library/react";
import { Simulate } from "react-dom/test-utils";
import * as React from "react";
import AuthForm from "../../src/components/AuthForm";
import sinon from "sinon";

describe("AuthForm component", () => {
  let sandbox;
  let clock;

  beforeEach(() => {
    jest.resetModules();
    sandbox = createSandbox();
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
    clock.restore();
  });
  describe("Single server config option", () => {
    it("should set the default server url in a visible field", () => {
      const node = createComponent(
        <AuthForm
          session={{ authenticated: false, serverInfo: DEFAULT_SERVERINFO }}
        />
      );

      const element = node.querySelector("input[id='root_server']");
      expect(element.type).eql("text");
      expect(element.value).eql(DEFAULT_KINTO_SERVER);
    });

    it("should set the server url value in hidden field", async () => {
      jest.doMock("../../src/constants", () => {
        const actual = jest.requireActual("../../src/constants");
        return {
          __esModule: true,
          ...actual,
          SINGLE_SERVER: "http://www.example.com/",
        };
      });
      const AuthForm = require("../../src/components/AuthForm").default;
      const node = createComponent(
        <AuthForm
          session={{ authenticated: false, serverInfo: DEFAULT_SERVERINFO }}
        />
      );
      const element = node.querySelector("input[id='root_server']");
      expect(element.type).eql("hidden");
      expect(element.value).eql("http://www.example.com/");
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
      node = createComponent(<AuthForm {...props} />);
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
      const node = createComponent(<AuthForm {...props} />);

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
      const node = createComponent(<AuthForm {...props} />);

      expect(node.querySelector("#root_server").value).eql(
        "http://server.test/v1"
      );
    });

    it("should set the authType field value using latest entry from servers history for that server", async () => {
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

      const form = render(<AuthForm {...props} />);
      const serverField = form.container.querySelector("#root_server");
      const authTypeField = form.container.querySelector("#root_authType");

      expect(serverField.value).eql("http://server.test/v1");
      expect(authTypeField.value).eql("basicauth");

      fireEvent.change(serverField, {
        target: { value: "http://test.server/v1" },
      });
      expect(serverField.value).eql("http://test.server/v1");
      expect(authTypeField.value).eql("anonymous");

      const updatedProps = {
        ...props,
        session: {
          ...props.session,
          serverInfo: {
            ...props.session.serverInfo,
            capabilities: {
              ...props.session.serverInfo.capabilities,
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

      form.rerender(<AuthForm {...updatedProps} />);
      const googleAuthButton = await form.findByText(
        "Sign in using OpenID Connect (Google)"
      );
      expect(googleAuthButton).to.exist;
    });
  });
});
