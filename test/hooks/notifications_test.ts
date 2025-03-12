import {
  clearNotifications,
  notifyError,
  notifyInfo,
  notifySuccess,
  notifyWarning,
  removeNotification,
  useNotifications,
} from "@src/hooks/notifications";
import { renderHook } from "@testing-library/react";

describe("notifications hooks", () => {
  beforeEach(() => {
    clearNotifications();
  });

  it("notifyInfo should create an info notification", async () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current).toEqual([]);
    notifyInfo("Test info message");

    await vi.waitFor(() => {
      expect(result.current.length).toBe(1);
    });

    expect(result.current[0]).toMatchObject({
      type: "info",
      message: "Test info message",
    });
  });

  it("notifySuccess should create a success notification", async () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current).toEqual([]);
    notifySuccess("Test success message");

    await vi.waitFor(() => {
      expect(result.current.length).toBe(1);
    });

    expect(result.current[0]).toMatchObject({
      type: "success",
      message: "Test success message",
    });
  });

  it("notifyWarning should create a warning notification", async () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current).toEqual([]);
    notifyWarning("Test warning message");

    await vi.waitFor(() => {
      expect(result.current.length).toBe(1);
    });

    expect(result.current[0]).toMatchObject({
      type: "warning",
      message: "Test warning message",
    });
  });

  it("notifyError should create an error notification", async () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current).toEqual([]);
    notifyError("Test error message");

    await vi.waitFor(() => {
      expect(result.current.length).toBe(1);
    });

    expect(result.current[0]).toMatchObject({
      type: "danger",
      message: "Test error message",
    });
  });

  it("removeNotification should remove the selected notification", async () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current).toEqual([]);

    notifyInfo("Test message 0");
    notifyInfo("Test message 1");
    notifyInfo("Test message 2");

    await vi.waitFor(() => {
      expect(result.current.length).toBe(3);
    });

    removeNotification(1);

    await vi.waitFor(() => {
      expect(result.current.length).toBe(2);
    });

    expect(result.current).toMatchObject([
      {
        message: "Test message 0",
      },
      {
        message: "Test message 2",
      },
    ]);
  });

  it("clearNotifications should remove all notifications", async () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current).toEqual([]);

    notifyInfo("Test message 0");
    notifyInfo("Test message 1");
    notifyInfo("Test message 2");

    await vi.waitFor(() => {
      expect(result.current.length).toBe(3);
    });

    clearNotifications();

    await vi.waitFor(() => {
      expect(result.current.length).toBe(0);
    });
  });

  it("useNotifications should keep a live list between all components", async () => {
    const { result: result1 } = renderHook(() => useNotifications());
    const { result: result2 } = renderHook(() => useNotifications());
    const { result: result3 } = renderHook(() => useNotifications());

    expect(result1.current).toEqual([]);
    expect(result2.current).toEqual([]);
    expect(result3.current).toEqual([]);

    notifyInfo("Test info");
    notifyWarning("Test warn");
    notifyError("Test error");

    await vi.waitFor(() => {
      let match = [
        { message: "Test info" },
        { message: "Test warn" },
        { message: "Test error" },
      ];
      expect(result1.current).toMatchObject(match);
      expect(result2.current).toMatchObject(match);
      expect(result3.current).toMatchObject(match);
    });

    removeNotification(1);

    await vi.waitFor(() => {
      let match = [{ message: "Test info" }, { message: "Test error" }];
      expect(result1.current).toMatchObject(match);
      expect(result2.current).toMatchObject(match);
      expect(result3.current).toMatchObject(match);
    });
  });
});
