import { Layout } from "@src/components/Layout";
import { ANONYMOUS_AUTH, DEFAULT_SERVERINFO } from "@src/constants";
import * as bucketHooks from "@src/hooks/bucket";
import * as heartbeatHooks from "@src/hooks/heartbeat";
import * as preferencesHooks from "@src/hooks/preferences";
import * as sessionHooks from "@src/hooks/session";
import { renderWithRouter } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

describe("App component", () => {
  const routeProps = { createRoutes: false, route: "/", path: "/" };
  const testServer = "http://test.server/v1/";
  const useServerInfoMock = vi.fn();
  const useAuthMock = vi.fn();
  const useHeartbeatMock = vi.fn();
  const useBucketListMock = vi.fn();
  const useShowSidebarMock = vi.fn();

  beforeEach(() => {
    vitest
      .spyOn(sessionHooks, "useServerInfo")
      .mockImplementation(useServerInfoMock);
    useServerInfoMock.mockReturnValue({
      ...DEFAULT_SERVERINFO,
      url: testServer,
    });
    vitest.spyOn(sessionHooks, "useAuth").mockImplementation(useAuthMock);
    vitest
      .spyOn(heartbeatHooks, "useHeartbeat")
      .mockImplementation(useHeartbeatMock);
    useHeartbeatMock.mockReturnValue({ success: true });
    vitest
      .spyOn(bucketHooks, "useBucketList")
      .mockImplementation(useBucketListMock);
    useBucketListMock.mockReturnValue(undefined);
    vitest
      .spyOn(preferencesHooks, "useShowSidebar")
      .mockImplementation(useShowSidebarMock);
    useShowSidebarMock.mockReturnValue([true]);
  });

  describe("Session top bar", () => {
    it("should not render a session top bar when not authenticated", () => {
      useAuthMock.mockReturnValueOnce(undefined);
      useServerInfoMock.mockReturnValueOnce(undefined);
      renderWithRouter(<Layout />, routeProps);
      expect(screen.queryByTestId("sessionInfo-bar")).toBeNull();
    });

    it("should render a session top bar when anonymous", async () => {
      useAuthMock.mockReturnValueOnce({
        authType: ANONYMOUS_AUTH,
        server: testServer,
      });

      const { container } = renderWithRouter(<Layout />, routeProps);
      const content = container.textContent;

      expect(content).toContain("Anonymous");
      expect(content).toContain(testServer);
    });

    it("should display a link to the server docs", async () => {
      useAuthMock.mockReturnValueOnce({
        authType: ANONYMOUS_AUTH,
        server: testServer,
      });

      renderWithRouter(<Layout />, routeProps);
      expect(screen.getByText(/Documentation/)).toHaveAttribute(
        "href",
        "https://remote-settings.readthedocs.io/"
      );
    });

    it("should render a session top bar when authenticated", async () => {
      const spy = vi.spyOn(sessionHooks, "logout");
      const serverInfo = {
        url: "http://test.server/v1/",
        capabilities: {},
        user: {
          id: "ldap:1234",
        },
      };
      const credentials = {
        username: "user",
        password: "pass",
      };
      useServerInfoMock.mockReturnValue(serverInfo);
      useAuthMock.mockReturnValue({
        server: serverInfo.url,
        authType: "ldap",
        credentials,
      });
      renderWithRouter(<Layout />, routeProps);
      const infoBar = screen.getByTestId("sessionInfo-bar");
      expect(infoBar).toBeDefined();

      const content = infoBar.textContent;
      expect(content).toContain(serverInfo.url);
      expect(content).toContain(serverInfo.user.id);
      expect(content).not.toContain(credentials.password);

      fireEvent.click(screen.getByText(/Logout/));
      expect(spy).toHaveBeenCalled();

      spy.mockClear();
    });
  });

  describe("Toggle sidebar", () => {
    it("should render a sidebar when true in prefs", () => {
      useShowSidebarMock.mockReturnValue([true, vi.fn()]);

      renderWithRouter(<Layout />, routeProps);

      expect(screen.queryByTestId("sidebar-panel")).toBeInTheDocument();
    });

    it("should not render a sidebar when false in prefs", () => {
      useShowSidebarMock.mockReturnValue([false, vi.fn()]);

      renderWithRouter(<Layout />, routeProps);

      expect(screen.queryByTestId("sidebar-panel")).not.toBeInTheDocument();
    });

    it("should toggle on click on icon", async () => {
      const setShowSidebar = vi.fn();
      useShowSidebarMock.mockImplementation(() => [true, setShowSidebar]);

      renderWithRouter(<Layout />, routeProps);

      expect(screen.queryByTestId("sidebar-panel")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("sidebar-toggle"));
      expect(setShowSidebar).toHaveBeenCalledWith(false);
    });
  });
});
