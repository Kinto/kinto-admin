import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-addons-test-utils";

import { createSandbox, createComponent } from "../test_utils";
import Notifications from "../../src/components/Notifications";

describe("Notifications component", () => {
  let sandbox, removeNotification;

  beforeEach(() => {
    sandbox = createSandbox();
    removeNotification = sandbox.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should render an error", () => {
    const node = createComponent(Notifications, {
      removeNotification,
      notifications: [{ type: "error", message: "fail" }],
    });

    expect(node.querySelectorAll(".notification")).to.have.length.of(1);
  });

  it("should not render a detailed error by default", () => {
    const node = createComponent(Notifications, {
      removeNotification,
      notifications: [{ type: "error", message: "fail", details: ["a", "b"] }],
    });

    expect(
      [].map.call(
        node.querySelectorAll(".notification ul li"),
        n => n.textContent
      )
    ).eql([]);
  });

  it("should render a detailed error when clicking the details button", () => {
    const node = createComponent(Notifications, {
      removeNotification,
      notifications: [{ type: "error", message: "fail", details: ["a", "b"] }],
    });

    Simulate.click(node.querySelector(".btn-details"));

    expect(
      [].map.call(
        node.querySelectorAll(".notification ul li"),
        n => n.textContent
      )
    ).eql(["a", "b"]);
  });

  it("should render multiple notifications", () => {
    const node = createComponent(Notifications, {
      removeNotification,
      notifications: [
        { type: "info", message: "info" },
        { type: "error", message: "fail" },
      ],
    });

    expect(
      [].map.call(node.querySelectorAll(".notification p"), n => n.textContent)
    ).eql(["info", "fail"]);
  });

  it("should remove a single notif when the list has one", () => {
    const node = createComponent(Notifications, {
      removeNotification,
      notifications: [{ type: "info", message: "plop" }],
    });

    Simulate.click(node.querySelector(".close"));

    sinon.assert.calledWith(removeNotification, 0);
  });

  it("should remove a single notif when the list has two", () => {
    const node = createComponent(Notifications, {
      removeNotification,
      notifications: [
        { type: "info", message: "plop" },
        { type: "info", message: "plap" },
      ],
    });

    // second notification close button clicked
    Simulate.click(node.querySelectorAll(".close")[1]);

    sinon.assert.calledWith(removeNotification, 1);
  });
});
