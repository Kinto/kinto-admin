import * as sessionActions from "@src/actions/session";
import { Layout } from "@src/components/Layout";
import { renderWithProvider } from "@test/testUtils";
import { fireEvent } from "@testing-library/react";
import React from "react";

describe("App component", () => {
  let app, store;
  beforeEach(() => {
    vi.spyOn(sessionActions, "logout");
    app = renderWithProvider(<Layout />);
    store = app.store;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Session top bar", () => {
    it("should not render a session top bar when not authenticated", () => {
      expect(app.queryByTestId("sessionInfo-bar")).toBeNull();
    });

    it("should render a session top bar when anonymous", () => {
      const serverInfo = {
        url: "http://test.server/v1/",
        capabilities: {},
      };
      store.dispatch(sessionActions.serverInfoSuccess(serverInfo));
      store.dispatch(sessionActions.setAuthenticated());
      const content = app.container.textContent;

      expect(content).toContain("Anonymous");
      expect(content).toContain(serverInfo.url);
    });

    it("should display a link to the server docs", () => {
      const serverInfo = {
        url: "http://test.server/v1/",
        project_docs: "https://remote-settings.readthedocs.io/",
        capabilities: {},
      };
      store.dispatch(sessionActions.serverInfoSuccess(serverInfo));
      store.dispatch(
        sessionActions.setAuthenticated({ user: { id: "fxa:abc" } })
      );

      expect(app.getByText(/Documentation/).href).toBe(serverInfo.project_docs);
    });

    it("should render a session top bar when authenticated", () => {
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
      store.dispatch(sessionActions.serverInfoSuccess(serverInfo));
      store.dispatch(sessionActions.setupComplete());
      store.dispatch(sessionActions.setAuthenticated(credentials));

      const infoBar = app.getByTestId("sessionInfo-bar");
      expect(infoBar).toBeDefined();

      const content = infoBar.textContent;
      expect(content).toContain(serverInfo.url);
      expect(content).toContain(serverInfo.user.id);
      expect(content).not.toContain(credentials.password);

      fireEvent.click(app.getByText(/Logout/));
      expect(sessionActions.logout).toHaveBeenCalled();
    });
  });
});
