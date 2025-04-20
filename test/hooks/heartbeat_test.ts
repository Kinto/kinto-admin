import { setClient } from "@src/client";
import { queryHeartbeat, useHeartbeat } from "@src/hooks/heartbeat";
import { renderHook } from "@testing-library/react";

describe("heartbeat hooks", () => {
  describe("query heartbeat", () => {
    const client = {
      execute: vi.fn(),
    };

    beforeAll(() => {
      setClient(client);
    });

    it("should return the expected default model for heartbeat response", async () => {
      const { result } = renderHook(() => useHeartbeat());
      client.execute.mockResolvedValueOnce({});
      queryHeartbeat();

      await vi.waitFor(() => {
        expect(client.execute).toHaveBeenCalled();
        expect(result.current).toStrictEqual({
          success: true,
          response: {},
        });
      });
    });

    it("should return the expected state model for heartbeat response ", async () => {
      const { result } = renderHook(() => useHeartbeat());
      client.execute.mockResolvedValueOnce({
        foo: true,
        bar: false,
      });

      queryHeartbeat();
      await vi.waitFor(() => {
        expect(client.execute).toHaveBeenCalled();
        expect(result.current).toStrictEqual({
          success: false,
          response: {
            foo: true,
            bar: false,
          },
        });
      });
    });

    it("should return false for success when the client throws", async () => {
      const { result } = renderHook(() => useHeartbeat());
      const err = new Error("throwing an error");

      client.execute.mockRejectedValueOnce(err);
      queryHeartbeat();
      await vi.waitFor(() => {
        expect(client.execute).toHaveBeenCalled();
        expect(result.current).toStrictEqual({
          success: false,
          details: err,
        });
      });
    });
  });
});
