import Notifications from "@src/components/Notifications";
import * as notificationsHooks from "@src/hooks/notifications";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

describe("Notifications component", () => {
  let removeNotificationParam, useNotificationsMock;

  beforeEach(() => {
    removeNotificationParam = null;
    useNotificationsMock = vi.spyOn(notificationsHooks, "useNotifications");
    vi.spyOn(notificationsHooks, "removeNotification").mockImplementation(
      idx => {
        removeNotificationParam = idx;
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render an error", () => {
    useNotificationsMock.mockReturnValue([{ type: "danger", message: "fail" }]);
    render(<Notifications />);

    expect(screen.getAllByTitle("Dismiss")).toHaveLength(1);
  });

  it("should render multiple notifications", () => {
    useNotificationsMock.mockReturnValue([
      { type: "info", message: "info" },
      { type: "danger", message: "fail" },
    ]);
    render(<Notifications />);

    expect(screen.getByText("info")).toBeDefined();
    expect(screen.getByText("fail")).toBeDefined();
  });

  it("should remove a single notif when the list has one", () => {
    useNotificationsMock.mockReturnValue([{ type: "info", message: "plop" }]);
    render(<Notifications />);

    fireEvent.click(screen.getByTitle("Dismiss"));
    expect(removeNotificationParam).toBe(0);
  });

  it("should remove a single notif when the list has two", () => {
    useNotificationsMock.mockReturnValue([
      { type: "info", message: "plop" },
      { type: "info", message: "plap" },
    ]);
    render(<Notifications />);
    // second notification close button clicked
    fireEvent.click(screen.getAllByTitle("Dismiss")[1]);
    expect(removeNotificationParam).toBe(1);
  });
});
