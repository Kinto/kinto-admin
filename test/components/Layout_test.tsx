import * as sessionActions from "@src/actions/session";
import { Layout } from "@src/components/Layout";
import { renderWithProvider } from "@test/testUtils";
import { act, fireEvent, screen } from "@testing-library/react";
import React from "react";

describe("App component", () => {
  describe("Session top bar", () => {
    it("should not render a session top bar when not authenticated", () => {
      renderWithProvider(<Layout />);
      expect(screen.queryByTestId("sessionInfo-bar")).toBeNull();
    });

    it("should render a session top bar when anonymous", async () => {
      const { store, container } = renderWithProvider(<Layout />);
      const serverInfo = {
        url: "http://test.server/v1/",
        capabilities: {},
      };
      act(() => {
        store.dispatch(sessionActions.serverInfoSuccess(serverInfo));
        store.dispatch(sessionActions.setAuthenticated());
      });
      const content = container.textContent;

      expect(content).toContain("Anonymous");
      expect(content).toContain(serverInfo.url);
    });

    it("should display a link to the server docs", async () => {
      const { store } = renderWithProvider(<Layout />);
      const serverInfo = {
        url: "http://test.server/v1/",
        project_docs: "https://remote-settings.readthedocs.io/",
        capabilities: {},
      };
      act(() => {
        store.dispatch(sessionActions.serverInfoSuccess(serverInfo));
        store.dispatch(
          sessionActions.setAuthenticated({ user: { id: "fxa:abc" } })
        );
      });
      expect(screen.getByText(/Documentation/)).toHaveAttribute(
        "href",
        serverInfo.project_docs
      );
    });

    it("should render a session top bar when authenticated", async () => {
      const { store } = renderWithProvider(<Layout />);
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
        store.dispatch(sessionActions.serverInfoSuccess(serverInfo));
        store.dispatch(sessionActions.setupComplete());
        store.dispatch(sessionActions.setAuthenticated(credentials));
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
