import * as sessionActions from "@src/actions/session";
import { Layout } from "@src/components/Layout";
import * as sessionSagas from "@src/sagas/session";
import { renderWithRouter } from "@test/testUtils";
import { act, fireEvent, screen } from "@testing-library/react";
import React from "react";

describe("App component", () => {
  const routeProps = { createRoutes: false, route: "/", path: "/" };
  const testServer = "http://test.server/v1/";

  beforeEach(() => {
    vitest.spyOn(sessionSagas, "getServerInfo").mockImplementation(vi.fn());
    vitest.spyOn(sessionSagas, "setupSession").mockImplementation(vi.fn());
  });

  describe("Session top bar", () => {
    it("should not render a session top bar when not authenticated", () => {
      renderWithRouter(<Layout />, routeProps);
      expect(screen.queryByTestId("sessionInfo-bar")).toBeNull();
    });

    it("should render a session top bar when anonymous", async () => {
      const { container } = renderWithRouter(<Layout />, routeProps);
      const content = container.textContent;

      expect(content).toContain("Anonymous");
      expect(content).toContain(testServer);
    });

    it("should display a link to the server docs", async () => {
      renderWithRouter(<Layout />, routeProps);
      expect(screen.getByText(/Documentation/)).toHaveAttribute(
        "href",
        "https://remote-settings.readthedocs.io/"
      );
    });

    it("should render a session top bar when authenticated", async () => {
      renderWithRouter(<Layout />, routeProps);
      const spy = vi.spyOn(sessionActions, "logout");
      const serverInfo = {
        url: "http://test.server/v1/",
        capabilities: {},
        user: {
          id: "fxa:1234",
        },
      };
      const credentials = {
        username: "user",
        password: "pass",
      };
      act(() => {
        // store.dispatch(sessionActions.serverInfoSuccess(serverInfo));
        // store.dispatch(sessionActions.setupComplete());
        // store.dispatch(sessionActions.setAuthenticated(credentials));
      });

      const infoBar = screen.getByTestId("sessionInfo-bar");
      expect(infoBar).toBeDefined();

      const content = infoBar.textContent;
      expect(content).toContain(serverInfo.url);
      expect(content).toContain(serverInfo.user.id);
      expect(content).not.toContain(credentials.password);

      fireEvent.click(screen.getByText(/Logout/));
      expect(sessionActions.logout).toHaveBeenCalled();

      spy.mockClear();
    });
  });
});
