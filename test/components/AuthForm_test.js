import { renderWithProvider } from "../test_utils";
import { DEFAULT_KINTO_SERVER } from "../../src/constants";
import { DEFAULT_SERVERINFO } from "../../src/reducers/session";
import { render, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import AuthForm from "../../src/components/AuthForm";

describe("AuthForm component", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe("Single server config option", () => {
    it("should set the default server url in a visible field", () => {
      const node = renderWithProvider(
        <AuthForm
          session={{ authenticated: false, serverInfo: DEFAULT_SERVERINFO }}
        />
      );

      const element = node.queryByLabelText("Server*");
      expect(element.type).toBe("text");
      expect(element.value).toBe(DEFAULT_KINTO_SERVER);
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
      setupSession = jest.fn();
      serverChange = jest.fn();
      (getServerInfo = async () => {
        new Promise(resolve => setTimeout(resolve, 1000)); // simulate server response taking a second
      }),
        (navigateToExternalAuth = jest.fn());
      navigateToOpenID = jest.fn();
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
      node = renderWithProvider(<AuthForm {...props} />);
    });

    it("should render a setup form", () => {
      expect(node.getByTestId("formWrapper")).toBeDefined();
    });

    describe("Basic Auth", () => {
      it("should submit setup data", async () => {
        fireEvent.change(node.queryByLabelText("Server*"), {
          target: { value: "http://test.server/v1" },
        });
        await node.findByTestId("spinner"); // spinner should show up
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 400))); // debounce wait
        expect(node.queryByTestId("spinner")).toBeNull(); // spinner should be gone by now

        fireEvent.click(node.getByLabelText("Basic Auth"));
        fireEvent.change(node.getByLabelText("Username*"), {
          target: { value: "user" },
        });
        fireEvent.change(node.getByLabelText("Password*"), {
          target: { value: "pass" },
        });

        fireEvent.click(node.getByText(/Sign in using/));
        expect(setupSession).toHaveBeenCalledWith({
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
        fireEvent.change(node.queryByLabelText("Server*"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
        fireEvent.click(node.getByLabelText("LDAP"));
        fireEvent.change(node.getByLabelText("Email*"), {
          target: { value: "you@email.com" },
        });
        fireEvent.change(node.getByLabelText("Password*"), {
          target: { value: "pass" },
        });
        fireEvent.click(node.getByText(/Sign in using/));
        expect(setupSession).toHaveBeenCalledWith({
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
        fireEvent.change(node.queryByLabelText("Server*"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
        fireEvent.click(node.getByLabelText("Firefox Account"));
        fireEvent.click(node.getByText(/Sign in using/));
        expect(navigateToExternalAuth).toHaveBeenCalledWith({
          server: "http://test.server/v1",
          authType: "fxa", // fxa = credentials omitted
          redirectURL: undefined,
        });
      });
    });

    describe("OpenID", () => {
      it("should navigate to external auth URL", async () => {
        fireEvent.change(node.queryByLabelText("Server*"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
        fireEvent.click(node.getByLabelText("OpenID Connect (Google)"));
        fireEvent.click(node.getByText(/Sign in using/));
        expect(navigateToOpenID).toHaveBeenCalledWith(
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
        serverChange: jest.fn(),
        getServerInfo: jest.fn(),
        servers: [],
        session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
      };
      const node = renderWithProvider(<AuthForm {...props} />);

      expect(node.queryByLabelText("Server*").value).toBe(
        "https://demo.kinto-storage.org/v1/"
      );
    });

    it("should set the server field value using latest entry from servers", () => {
      const props = {
        match: {},
        serverChange: jest.fn(),
        getServerInfo: jest.fn(),
        servers: [{ server: "http://server.test/v1", authType: "anonymous" }],
        session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
      };
      const node = renderWithProvider(<AuthForm {...props} />);

      expect(node.queryByLabelText("Server*").value).toBe(
        "http://server.test/v1"
      );
    });

    it("should set the authType field value using latest entry from servers history for that server", async () => {
      const props = {
        match: {},
        serverChange: jest.fn(),
        getServerInfo: jest.fn(),
        servers: [
          { server: "http://server.test/v1", authType: "basicauth" },
          { server: "http://test.server/v1", authType: "openid-google" },
        ],
        session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
      };

      const form = render(<AuthForm {...props} />);
      const serverField = form.getByLabelText("Server*");

      expect(serverField.value).toBe("http://server.test/v1");
      expect(form.getByText("BasicAuth credentials")).toBeDefined();

      fireEvent.change(serverField, {
        target: { value: "http://test.server/v1" },
      });
      await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
      expect(serverField.value).toBe("http://test.server/v1");
      expect(
        form.getByText("Sign in using OpenID Connect (Google)")
      ).toBeDefined();

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
      expect(googleAuthButton).toBeDefined();
    });
  });
});
