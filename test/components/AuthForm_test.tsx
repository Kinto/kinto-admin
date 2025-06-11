import * as client from "@src/client";
import AuthForm from "@src/components/AuthForm";
import { DEFAULT_KINTO_SERVER, DEFAULT_SERVERINFO } from "@src/constants";
import * as serverHooks from "@src/hooks/servers";
import * as sessionHooks from "@src/hooks/session";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";

describe("AuthForm component", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("Single server config option", () => {
    it("should set the default server url in a visible field", () => {
      renderWithRouter(<AuthForm />);

      const element = screen.queryByLabelText("Server*");
      expect(element.type).toBe("text");
      expect(element.value).toBe(DEFAULT_KINTO_SERVER);
    });
  });
  describe("Authentication types", () => {
    const mockClearServersHistory = vi.fn();
    const mockUseServers = vi.fn();
    const mockFetchServerInfo = vi.fn();
    let mockLocation = {
      href: "",
    };

    beforeEach(() => {
      vi.restoreAllMocks();
      vi.spyOn(serverHooks, "useServers").mockImplementation(mockUseServers);
      vi.spyOn(serverHooks, "clearServersHistory").mockImplementation(
        mockClearServersHistory
      );
      vi.spyOn(sessionHooks, "setAuth");
      vi.stubGlobal("location", mockLocation);

      vi.spyOn(client, "setupClient").mockReturnValue({
        fetchServerInfo: mockFetchServerInfo,
      });

      mockFetchServerInfo.mockResolvedValue({
        ...DEFAULT_SERVERINFO,
        capabilities: {
          basicauth: "some basic auth info",
          ldap: "some ldap auth info",
          fxa: "some fxa auth info",
          openid: {
            providers: [
              {
                name: "google",
                auth_path: "auth_path",
              },
            ],
          },
        },
        user: {},
      });
      mockUseServers.mockReturnValue([
        { server: "http://server.test/v1", authType: "accounts" },
      ]);
      renderWithRouter(<AuthForm />);
    });

    it("should render a setup form", () => {
      expect(screen.getByTestId("formWrapper")).toBeDefined();
    });

    describe("Basic Auth", () => {
      it("should submit setup data", async () => {
        fireEvent.change(screen.queryByLabelText("Server*"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait

        fireEvent.click(screen.getByLabelText("Basic Auth"));
        fireEvent.change(screen.getByLabelText("Username*"), {
          target: { value: "user" },
        });
        fireEvent.change(screen.getByLabelText("Password*"), {
          target: { value: "pass" },
        });

        fireEvent.click(screen.getByText(/Sign in using/));
        await vi.waitFor(() => {
          expect(sessionHooks.setAuth).toHaveBeenCalledWith({
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
        await vi.waitFor(() => {
          expect(sessionHooks.setAuth).toHaveBeenCalledWith({
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
      it("should navigate to external auth URL", async () => {
        fireEvent.change(screen.queryByLabelText("Server*"), {
          target: { value: "http://test.server/v1" },
        });
        await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
        fireEvent.click(screen.getByLabelText("Firefox Account"));
        fireEvent.click(screen.getByText(/Sign in using/));
        expect(window.location.href).toBe(
          "http://test.server/v1/fxa-oauth/login?redirect=http%3A%2F%2Flocalhost%3A3000%2F%23%2Fauth%2FeyJzZXJ2ZXIiOiJodHRwOi8vdGVzdC5zZXJ2ZXIvdjEiLCJhdXRoVHlwZSI6ImZ4YSJ9%2F"
        );
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
        expect(window.location.href).toBe(
          "http://test.server/v1/auth_path?callback=http%3A%2F%2Flocalhost%3A3000%2F%23%2Fauth%2FeyJzZXJ2ZXIiOiJodHRwOi8vdGVzdC5zZXJ2ZXIvdjEiLCJhdXRoVHlwZSI6Im9wZW5pZC1nb29nbGUifQ%3D%3D%2F&scope=openid email"
        );
      });
    });
  });

  describe("Servers history support", () => {
    it("should set the server field value using a default value if there's no servers", () => {
      vi.spyOn(serverHooks, "useServers").mockReturnValue([]);
      renderWithRouter(<AuthForm />);
      expect(screen.queryByLabelText("Server*").value).toBe(
        "https://demo.kinto-storage.org/v1/"
      );
    });

    it("should set the server field value using latest entry from servers", () => {
      vi.spyOn(serverHooks, "useServers").mockReturnValue([
        { server: "http://server.test/v1", authType: "anonymous" },
      ]);
      renderWithRouter(<AuthForm />);

      expect(screen.queryByLabelText("Server*").value).toBe(
        "http://server.test/v1"
      );
    });

    it("should set the authType field value using latest entry from servers history for that server", async () => {
      vi.spyOn(serverHooks, "useServers").mockReturnValue([
        { server: "http://server.test/v1", authType: "basicauth" },
        { server: "http://test.server/v1", authType: "openid-google" },
      ]);
      const mockFetchServerInfo = vi.fn().mockResolvedValue({
        ...DEFAULT_SERVERINFO,
        capabilities: {
          basicauth: "some basic auth info",
          ldap: "some ldap auth info",
          fxa: "some fxa auth info",
          openid: {
            providers: [
              {
                name: "google",
                auth_path: "auth_path",
              },
            ],
          },
        },
      });
      vi.spyOn(client, "setupClient").mockReturnValue({
        fetchServerInfo: mockFetchServerInfo,
      });

      const form = render(<AuthForm />);
      const serverField = form.getByLabelText("Server*");

      await waitFor(() => {
        expect(serverField.value).toBe("http://server.test/v1");
        expect(form.getByText("BasicAuth credentials")).toBeDefined();
      });

      fireEvent.change(serverField, {
        target: { value: "http://test.server/v1" },
      });
      await waitFor(() => new Promise(resolve => setTimeout(resolve, 500))); // debounce wait
      expect(serverField.value).toBe("http://test.server/v1");
      expect(
        form.getByText("Sign in using OpenID Connect (Google)")
      ).toBeDefined();

      const googleAuthButton = await form.findByText(
        "Sign in using OpenID Connect (Google)"
      );
      expect(googleAuthButton).toBeDefined();
    });
  });
});
