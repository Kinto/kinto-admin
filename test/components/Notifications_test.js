import Notifications from "../../src/components/Notifications";
import React from "react";
import { fireEvent, render } from "@testing-library/react";

describe("Notifications component", () => {
  let removeNotificationParam;

  const removeNotification = idx => {
    removeNotificationParam = idx;
  };

  beforeEach(() => {
    removeNotificationParam = null;
  });

  it("should render an error", () => {
    const node = render(
      <Notifications
        removeNotification={removeNotification}
        notifications={[{ type: "danger", message: "fail" }]}
      />
    );

    expect(node.getAllByTitle("Dismiss")).toHaveLength(1);
  });

  it("should render multiple notifications", () => {
    const node = render(
      <Notifications
        removeNotification={removeNotification}
        notifications={[
          { type: "info", message: "info" },
          { type: "danger", message: "fail" },
        ]}
      />
    );

    expect(node.getByText("info")).toBeDefined();
    expect(node.getByText("fail")).toBeDefined();
  });

  it("should remove a single notif when the list has one", () => {
    const node = render(
      <Notifications
        removeNotification={removeNotification}
        notifications={[{ type: "info", message: "plop" }]}
      />
    );

    fireEvent.click(node.getByTitle("Dismiss"));
    expect(removeNotificationParam).toBe(0);
  });

  it("should remove a single notif when the list has two", () => {
    const node = render(
      <Notifications
        removeNotification={removeNotification}
        notifications={[
          { type: "info", message: "plop" },
          { type: "info", message: "plap" },
        ]}
      />
    );
    // second notification close button clicked
    fireEvent.click(node.getAllByTitle("Dismiss")[1]);
    expect(removeNotificationParam).toBe(1);
  });
});
