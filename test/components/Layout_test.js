import React from "react";

import { Layout } from "../../src/components/Layout";
import * as sessionActions from "../../src/actions/session";
import { renderWithProvider } from "../test_utils";

describe("App component", () => {
  let app, store, container;
  beforeEach(() => {
    jest.spyOn(sessionActions, "logout");
    app, ({ store, container } = renderWithProvider(<Layout />));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Session top bar", () => {
    it("should not render a session top bar when not authenticated", () => {
      expect(container.querySelectorAll(".session-info-bar")).toHaveLength(0);
    });

    it("should render a session top bar when anonymous", () => {
      const serverInfo = {
        url: "http://test.server/v1/",
        capabilities: {},
      };
      store.dispatch(sessionActions.serverInfoSuccess(serverInfo));
      store.dispatch(sessionActions.setAuthenticated());
      const content = container.textContent;

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

      const infoBar = container.querySelector(
        ".session-info-bar a.project-docs"
      );
      expect(infoBar.href).toBe(serverInfo.project_docs);
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

      const infoBar = container.querySelectorAll(".session-info-bar");
      expect(infoBar).toHaveLength(1);

      const content = infoBar[0].textContent;
      expect(content).toContain(serverInfo.url);
      expect(content).toContain(serverInfo.user.id);
      expect(content).not.toContain(credentials.password);

      container.querySelector(".btn-logout").click();
      expect(sessionActions.logout).toHaveBeenCalled();
    });
  });
});
