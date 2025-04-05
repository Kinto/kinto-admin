import { addServer, clearServersHistory, useServers } from "@src/hooks/servers";
import { renderHook } from "@testing-library/react";

describe("servers hooks", () => {
  describe("servers add", () => {
    beforeEach(() => {
      clearServersHistory();
    });

    it("should add server to recent history", async () => {
      const { result } = renderHook(() => useServers());
      expect(result.current).toEqual([]);

      addServer("http://server.test/v1", "basicauth");

      await vi.waitFor(() => {
        expect(result.current.length).toBe(1);
        expect(result.current).toEqual([
          { server: "http://server.test/v1", authType: "basicauth" },
        ]);
      });
    });

    it("should not prepend a duplicate entry in stack", async () => {
      const { result } = renderHook(() => useServers());
      expect(result.current).toEqual([]);

      addServer("http://server.test/v1", "basicauth");

      await vi.waitFor(() => {
        expect(result.current.length).toBe(1);
        expect(result.current).toEqual([
          { server: "http://server.test/v1", authType: "basicauth" },
        ]);
      });

      addServer("http://server.test/v1", "basicauth2");
      await vi.waitFor(() => {
        expect(result.current.length).toBe(1);
      });
    });
  });
});
