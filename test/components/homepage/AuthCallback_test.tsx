import AuthCallback from "@src/components/homepage/AuthCallback";
import * as sessionHooks from "@src/hooks/session";
import { renderWithRouter } from "@test/testUtils";
import { waitFor } from "@testing-library/react";
import * as React from "react";

describe("AuthCallback component", () => {
  const mockUseAuth = vi.fn();
  const mockSetAuth = vi.fn();

  beforeEach(() => {
    // Ensure atob exists in the test env
    if (!(globalThis as any).atob) {
      (globalThis as any).atob = (b64: string) =>
        Buffer.from(b64, "base64").toString("binary");
    }

    vi.spyOn(sessionHooks, "useAuth").mockImplementation(mockUseAuth);
    vi.spyOn(sessionHooks, "setAuth").mockImplementation(mockSetAuth);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers(); // just in case some other test enabled fake timers
  });

  it("sets up session when mounted", async () => {
    const fakeDate = new Date(2024, 1, 2, 3, 4, 5, 6);
    vi.setSystemTime(fakeDate); // you do not need vi.useFakeTimers()

    const payload =
      "eyJzZXJ2ZXIiOiJodHRwczovL2RlbW8ua2ludG8tc3RvcmFnZS5vcmcvdjEvIiwiYXV0aFR5cGUiOiJvcGVuaWQtYXV0aDAiLCJyZWRpcmVjdFVSTCI6bnVsbH0";
    const token =
      "%7B%22access_token%22%3A%22oXJNgbNayWPKF%22%2C%22id_token%22%3A%22eyJ0eXAd%22%2C%22expires_in%22%3A86400%2C%22token_type%22%3A%22Bearer%22%7D";

    renderWithRouter(<AuthCallback />, {
      route: `/auth/${payload}/${token}`,
      path: "/auth/:payload/:token",
    });

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith({
        authType: "openid",
        provider: "auth0",
        tokenType: "Bearer",
        credentials: { token: "oXJNgbNayWPKF" },
        server: "https://demo.kinto-storage.org/v1/",
        expiresAt: fakeDate.getTime() + 86400 * 1000,
      });
    });
  });
});
