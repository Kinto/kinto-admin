import AuthForm from "@src/components/AuthForm";
import { DEFAULT_KINTO_SERVER } from "@src/constants";
import { DEFAULT_SERVERINFO } from "@src/reducers/session";
import { renderWithProvider } from "@test/testUtils";
import { screen } from "@testing-library/react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";

describe("AuthForm component", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("Single server config option", () => {
    it("should set the default server url in a visible field", () => {
      renderWithProvider(
        <AuthForm
          session={{ authenticated: false, serverInfo: DEFAULT_SERVERINFO }}
        />
      );

      const element = screen.queryByLabelText("Server*");
      expect(element.type).toBe("text");
      expect(element.value).toBe(DEFAULT_KINTO_SERVER);
    });
  });
  describe("Authentication types", () => {
    let setupSession,
      getServerInfo,
      navigateToExternalAuth,
      navigateToOpenID,
      serverChange;

    beforeEach(() => {
      setupSession = vi.fn();
      serverChange = vi.fn();
      (getServerInfo = async () => {
        return new Promise(resolve => setTimeout(resolve, 100)); // simulate server response taking 100ms
      }),
        (navigateToExternalAuth = vi.fn());
      navigateToOpenID = vi.fn();
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
      renderWithProvider(<AuthForm {...props} />);
    });

    it("should render a setup form", () => {
      expect(screen.getByTestId("formWrapper")).toBeDefined();
    });

    describe("Basic Auth", () => {
      it("should submit setup data", async () => {
        fireEvent.change(screen.queryByLabelText("Server*"), {
          target: { value: "http://test.server/v1" },
        });
        await screen.findByTestId("spinner"); // spinner should show up
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
        expect(screen.queryByTestId("spinner")).toBeNull(); // spinner should be gone by now

        fireEvent.click(screen.getByLabelText("Basic Auth"));
        fireEvent.change(screen.getByLabelText("Username*"), {
          target: { value: "user" },
        });
        fireEvent.change(screen.getByLabelText("Password*"), {
          target: { value: "pass" },
        });

        fireEvent.click(screen.getByText(/Sign in using/));
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
        fireEvent.change(screen.queryByLabelText("Server*"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
        fireEvent.click(screen.getByLabelText("LDAP"));
        fireEvent.change(screen.getByLabelText("Email*"), {
          target: { value: "you@email.com" },
        });
        fireEvent.change(screen.getByLabelText("Password*"), {
          target: { value: "pass" },
        });
        fireEvent.click(screen.getByText(/Sign in using/));
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
        fireEvent.change(screen.queryByLabelText("Server*"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
        fireEvent.click(screen.getByLabelText("Firefox Account"));
        fireEvent.click(screen.getByText(/Sign in using/));
        expect(navigateToExternalAuth).toHaveBeenCalledWith({
          server: "http://test.server/v1",
          authType: "fxa", // fxa = credentials omitted
          redirectURL: undefined,
        });
      });
    });

    describe("OpenID", () => {
      it("should navigate to external auth URL", async () => {
        fireEvent.change(screen.queryByLabelText("Server*"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
        fireEvent.click(screen.getByLabelText("OpenID Connect (Google)"));
        fireEvent.click(screen.getByText(/Sign in using/));
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
        serverChange: vi.fn(),
        getServerInfo: vi.fn(),
        servers: [],
        session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
      };
      renderWithProvider(<AuthForm {...props} />);

      expect(screen.queryByLabelText("Server*").value).toBe(
        "https://demo.kinto-storage.org/v1/"
      );
    });

    it("should set the server field value using latest entry from servers", () => {
      const props = {
        match: {},
        serverChange: vi.fn(),
        getServerInfo: vi.fn(),
        servers: [{ server: "http://server.test/v1", authType: "anonymous" }],
        session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
      };
      renderWithProvider(<AuthForm {...props} />);

      expect(screen.queryByLabelText("Server*").value).toBe(
        "http://server.test/v1"
      );
    });

    it("should set the authType field value using latest entry from servers history for that server", async () => {
      const props = {
        match: {},
        serverChange: vi.fn(),
        getServerInfo: vi.fn(),
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
