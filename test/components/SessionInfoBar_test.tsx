import { setClient } from "@src/client";
import { SessionInfoBar } from "@src/components/SessionInfoBar";
import { renderWithProvider } from "@test/testUtils";
import { screen, waitFor } from "@testing-library/react";

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
    vi.resetAllMocks();
  });

  it("Should show green server status by default and render user/server info as expected", async () => {
    client.execute.mockResolvedValue({});
    renderWithProvider(<SessionInfoBar />);
    await waitFor(() => new Promise(resolve => setTimeout(resolve, 100))); // debounce wait
    expect(screen.getByTitle(healthyStr)).toBeDefined();

    expect(screen.getByTitle("Copy authentication header")).toBeDefined();
    expect(screen.getByText("Documentation")).toBeDefined();
    expect(screen.getByText("Logout")).toBeDefined();
    expect(screen.getByText("Anonymous")).toBeDefined();
  });

  it("Should show green server status when heartbeat returns all true checks", async () => {
    client.execute.mockResolvedValue({
      foo: true,
      bar: true,
    });
    renderWithProvider(<SessionInfoBar />);
    await waitFor(() => new Promise(resolve => setTimeout(resolve, 100))); // debounce wait
    expect(screen.getByTitle(healthyStr)).toBeDefined();
  });

  it("Should show failed server status when heartbeat returns any false checks", async () => {
    client.execute.mockResolvedValue({
      foo: false,
      bar: true,
    });
    renderWithProvider(<SessionInfoBar />);
    await waitFor(() => new Promise(resolve => setTimeout(resolve, 100))); // debounce wait
    expect(client.execute).toHaveBeenCalled();
    expect(screen.getByTitle(unhealthyStr)).toBeDefined();
  });

  it("Should show failed server status when heartbeat check throws an error", async () => {
    client.execute.mockImplementation(() => {
      throw new Error("Test error");
    });
    renderWithProvider(<SessionInfoBar />);
    await waitFor(() => new Promise(resolve => setTimeout(resolve, 100))); // debounce wait
    expect(screen.getByTitle(unhealthyStr)).toBeDefined();
  });
});
