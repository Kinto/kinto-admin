import { createSandbox, createComponent } from "../test_utils";
import { DEFAULT_KINTO_SERVER } from "../../src/constants";
import { DEFAULT_SERVERINFO } from "../../src/reducers/session";
import { expect } from "chai";
import { render, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import AuthForm from "../../src/components/AuthForm";
import sinon from "sinon";

describe("AuthForm component", () => {
  let sandbox;

  beforeEach(() => {
    jest.resetModules();
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
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
      it("should submit setup data", async () => {
        fireEvent.change(node.querySelector("#root_server"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait

        fireEvent.click(node.querySelectorAll("[type=radio]")[1]);
        fireEvent.change(node.querySelector("#root_credentials_username"), {
          target: { value: "user" },
        });
        fireEvent.change(node.querySelector("#root_credentials_password"), {
          target: { value: "pass" },
        });

        fireEvent.submit(node.querySelector("form"));
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
      it("should submit setup data", async () => {
        fireEvent.change(node.querySelector("#root_server"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
        fireEvent.click(node.querySelectorAll("[type=radio]")[3]);
        fireEvent.change(node.querySelector("#root_credentials_username"), {
          target: { value: "you@email.com" },
        });
        fireEvent.change(node.querySelector("#root_credentials_password"), {
          target: { value: "pass" },
        });
        fireEvent.submit(node.querySelector("form"));
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
      it("should navigate to external auth URL", async () => {
        fireEvent.change(node.querySelector("#root_server"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
        fireEvent.click(node.querySelectorAll("[type=radio]")[2]);
        fireEvent.change(node.querySelector("form"));
        fireEvent.submit(node.querySelector("form"));
        sinon.assert.calledWithExactly(navigateToExternalAuth, {
          server: "http://test.server/v1",
          authType: "fxa", // fxa = credentials omitted
          redirectURL: undefined,
        });
      });
    });

    describe("OpenID", () => {
      it("should navigate to external auth URL", async () => {
        fireEvent.change(node.querySelector("#root_server"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
        fireEvent.click(node.querySelectorAll("[type=radio]")[4]);
        fireEvent.submit(node.querySelector("form"));
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
      await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
      expect(serverField.value).eql("http://test.server/v1");
      expect(authTypeField.value).eql("openid-google");

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
