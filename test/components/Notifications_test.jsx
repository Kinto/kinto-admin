import Notifications from "../../src/components/Notifications";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

describe("Notifications component", () => {
  let removeNotificationParam;

  const removeNotification = idx => {
    removeNotificationParam = idx;
  };

  beforeEach(() => {
    removeNotificationParam = null;
  });

  it("should render an error", () => {
    render(
      <Notifications
        removeNotification={removeNotification}
        notifications={[{ type: "danger", message: "fail" }]}
      />
    );

    expect(screen.getAllByTitle("Dismiss")).toHaveLength(1);
  });

  it("should render multiple notifications", () => {
    render(
      <Notifications
        removeNotification={removeNotification}
        notifications={[
          { type: "info", message: "info" },
          { type: "danger", message: "fail" },
        ]}
      />
    );

    expect(screen.getByText("info")).toBeDefined();
    expect(screen.getByText("fail")).toBeDefined();
  });

  it("should remove a single notif when the list has one", () => {
    render(
      <Notifications
        removeNotification={removeNotification}
        notifications={[{ type: "info", message: "plop" }]}
      />
    );

    fireEvent.click(screen.getByTitle("Dismiss"));
    expect(removeNotificationParam).toBe(0);
  });

  it("should remove a single notif when the list has two", () => {
    render(
      <Notifications
        removeNotification={removeNotification}
        notifications={[
          { type: "info", message: "plop" },
          { type: "info", message: "plap" },
        ]}
      />
    );
    // second notification close button clicked
    fireEvent.click(screen.getAllByTitle("Dismiss")[1]);
    expect(removeNotificationParam).toBe(1);
  });
});
