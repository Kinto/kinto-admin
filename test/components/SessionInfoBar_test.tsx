import { setClient } from "@src/client";
import { SessionInfoBar } from "@src/components/SessionInfoBar";
import { DEFAULT_SERVERINFO } from "@src/constants";
import * as sessionHooks from "@src/hooks/session";
import { renderWithRouter } from "@test/testUtils";
import { act, screen } from "@testing-library/react";
import React from "react";

describe("SessionInfoBar component", () => {
  const client = {
    execute: vi.fn(),
  };
  const healthyStr = "Server heartbeat status is healthy";
  const unhealthyStr = "Server heartbeat status IS NOT healthy";

  beforeAll(() => {
    setClient(client);
  });

  beforeEach(() => {
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(DEFAULT_SERVERINFO);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("Should show green server status by default and render user/server info as expected, and render again every minute", async () => {
    vi.useFakeTimers();
    const fakeDate = new Date(2024, 0, 1);
    vi.setSystemTime(fakeDate);

    client.execute.mockResolvedValue({});
    expect(client.execute).toHaveBeenCalledTimes(0);
    renderWithRouter(<SessionInfoBar />);
    await vi.waitFor(() => {
      expect(client.execute).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTitle(healthyStr)).toBeDefined();
    expect(screen.getByText("Documentation")).toBeDefined();
    expect(screen.getByText("Logout")).toBeDefined();
    expect(screen.getByText("Anonymous")).toBeDefined();
    // Copy auth header should not render for anonymous logins
    expect(screen.queryByTitle("Copy authentication header")).toBeNull();
  });

  it("Should show copy authentication header when a user is logged in", async () => {
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue({
      ...DEFAULT_SERVERINFO,
      user: { id: "foo" },
    });
    renderWithRouter(<SessionInfoBar />);
    expect(screen.getByText("Logout")).toBeDefined();
    expect(screen.getByText("foo")).toBeDefined();
    expect(screen.getByTitle("Copy authentication header")).toBeDefined();
  });

  it("Should show green server status when heartbeat returns all true checks", async () => {
    client.execute.mockResolvedValue({
      foo: true,
      bar: true,
    });
    renderWithRouter(<SessionInfoBar />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTitle(healthyStr)).toBeDefined();
  });

  it("Should show failed server status when heartbeat returns any false checks", async () => {
    client.execute.mockResolvedValue({
      foo: false,
      bar: true,
    });
    renderWithRouter(<SessionInfoBar />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(client.execute).toHaveBeenCalled();
    expect(screen.getByTitle(unhealthyStr)).toBeDefined();
  });

  it("Should show failed server status when heartbeat check throws an error", async () => {
    client.execute.mockImplementation(() => {
      throw new Error("Test error");
    });
    renderWithRouter(<SessionInfoBar />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(client.execute).toHaveBeenCalled();
    expect(screen.getByTitle(unhealthyStr)).toBeDefined();
  });
});
