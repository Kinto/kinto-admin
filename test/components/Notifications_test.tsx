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
      id => {
        removeNotificationParam = id;
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
    useNotificationsMock.mockReturnValue([
      { type: "info", message: "plop", id: "id" },
    ]);
    render(<Notifications />);

    fireEvent.click(screen.getByTitle("Dismiss"));
    expect(removeNotificationParam).toBe("id");
  });

  it("should remove a single notif when the list has two", () => {
    useNotificationsMock.mockReturnValue([
      { type: "info", message: "plop", id: "id1" },
      { type: "info", message: "plap", id: "id2" },
    ]);
    render(<Notifications />);
    // second notification close button clicked
    fireEvent.click(screen.getAllByTitle("Dismiss")[1]);
    expect(removeNotificationParam).toBe("id2");
  });
});
