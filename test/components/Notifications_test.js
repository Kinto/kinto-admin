import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-dom/test-utils";

import { createSandbox, createComponent } from "../test_utils";
import Notifications from "../../src/components/Notifications";
import * as React from "react";

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
    const node = createComponent(
      <Notifications
        removeNotification={removeNotification}
        notifications={[{ type: "danger", message: "fail" }]}
      />
    );

    expect(node.querySelectorAll(".alert")).to.have.a.lengthOf(1);
  });

  it("should render multiple notifications", () => {
    const node = createComponent(
      <Notifications
        removeNotification={removeNotification}
        notifications={[
          { type: "info", message: "info" },
          { type: "danger", message: "fail" },
        ]}
      />
    );

    expect(
      [].map.call(node.querySelectorAll(".alert h4"), n => n.textContent)
    ).eql(["info", "fail"]);
  });

  it("should remove a single notif when the list has one", () => {
    const node = createComponent(
      <Notifications
        removeNotification={removeNotification}
        notifications={[{ type: "info", message: "plop" }]}
      />
    );

    Simulate.click(node.querySelector(".close"));

    sinon.assert.calledWith(removeNotification, 0);
  });

  it("should remove a single notif when the list has two", () => {
    const node = createComponent(
      <Notifications
        removeNotification={removeNotification}
        notifications={[
          { type: "info", message: "plop" },
          { type: "info", message: "plap" },
        ]}
      />
    );
    // second notification close button clicked
    Simulate.click(node.querySelectorAll(".close")[1]);

    sinon.assert.calledWith(removeNotification, 1);
  });
});
