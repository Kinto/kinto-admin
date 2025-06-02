import { setClient } from "@src/client";
import { useHeartbeat } from "@src/hooks/heartbeat";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("query heartbeat", () => {
  const client = {
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    setClient(client);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it("should return the expected default model for heartbeat response", async () => {
    const { result } = renderHook(() => useHeartbeat());

    expect(result.current).toStrictEqual({
      success: true,
      response: {},
    });
  });

  it("should return the expected state model for heartbeat response ", async () => {
    const response = { serviceA: true, serviceB: false };
    client.execute.mockResolvedValue(response);

    const { result } = renderHook(() => useHeartbeat());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      success: false,
      response,
    });
  });

  it("should return false for success when the client throws", async () => {
    const error = new Error("Network error");
    client.execute.mockRejectedValue(error);

    const { result } = renderHook(() => useHeartbeat());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      success: false,
      details: error,
    });
  });

  it("should re-run heartbeat after 60 seconds", async () => {
    const response1 = { serviceA: true };
    const response2 = { serviceA: false };

    client.execute
      .mockResolvedValueOnce(response1)
      .mockResolvedValueOnce(response2);

    const { result } = renderHook(() => useHeartbeat());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      success: true,
      response: response1,
    });

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      success: false,
      response: response2,
    });
  });
});
