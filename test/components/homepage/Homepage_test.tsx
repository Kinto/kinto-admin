import { HomePage } from "@src/components/homepage/HomePage";
import { DEFAULT_SERVERINFO } from "@src/constants";
import * as sessionHooks from "@src/hooks/session";
import * as localStore from "@src/store/localStore";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";
import React from "react";

describe("HomePage component", () => {
  afterEach(() => {
    localStore.clearSession();
  });
  const mockUseAuth = vi.fn();
  const mockUseServerInfo = vi.fn();
  const mockSetAuth = vi.fn();

  beforeEach(() => {
    vi.spyOn(sessionHooks, "useAuth").mockImplementation(mockUseAuth);
    vi.spyOn(sessionHooks, "useServerInfo").mockImplementation(
      mockUseServerInfo
    );
    vi.spyOn(sessionHooks, "setAuth").mockImplementation(mockSetAuth);
  });

  describe("Authenticating", () => {
    it("loads a spinner when authenticating", async () => {
      mockUseAuth.mockReturnValue({});
      mockUseServerInfo.mockReturnValue(undefined);
      renderWithRouter(<HomePage />);
      expect(await screen.findByTestId("spinner")).toBeDefined();
    });
  });

  describe("Not authenticated", () => {
    describe("After OpenID redirection", () => {
      it("should setup session when component is mounted", () => {
        vi.useFakeTimers();
        const fakeDate = new Date(2024, 1, 2, 3, 4, 5, 6);
        vi.setSystemTime(fakeDate);

        const payload =
          "eyJzZXJ2ZXIiOiJodHRwczovL2RlbW8ua2ludG8tc3RvcmFnZS5vcmcvdjEvIiwiYXV0aFR5cGUiOiJvcGVuaWQtYXV0aDAiLCJyZWRpcmVjdFVSTCI6bnVsbH0";
        const token =
          "%7B%22access_token%22%3A%22oXJNgbNayWPKF%22%2C%22id_token%22%3A%22eyJ0eXAd%22%2C%22expires_in%22%3A86400%2C%22token_type%22%3A%22Bearer%22%7D";
        renderWithRouter(<HomePage />, {
          route: `/auth/${payload}/${token}`,
          path: "/auth/:payload/:token",
        });

        expect(mockSetAuth).toHaveBeenCalledWith({
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
    it("should render server information heading with default info if it cannot be fetched", async () => {
      mockUseServerInfo.mockReturnValue(DEFAULT_SERVERINFO);
      renderWithRouter(<HomePage />);

      expect(screen.getByText("Properties").textContent).toBeDefined();
      vi.waitFor(() => {
        expect(
          [].map.call(screen.getAllByTestId("home-th"), x => x.textContent)
        ).toStrictEqual([
          "url",
          "capabilities",
          "project_name",
          "project_docs",
        ]);
      });
    });
  });
});
