import { expect } from "chai";
import React from "react";

import Notifications from "../../scripts/containers/Notifications";
import { setupContainer, nodeTexts, findAll, click } from "../test-utils";


describe("Notifications container", () => {
  it("should render an error", () => {
    const comp = setupContainer(<Notifications/>, {notifications: [
      {type: "error", message: "fail"},
    ]});

    expect(findAll(comp, ".notification")).to.have.length.of(1);
  });

  it("should render a detailed error", () => {
    const comp = setupContainer(<Notifications/>, {notifications: [
      {type: "error", message: "fail", details: ["a", "b"]},
    ]});

    expect(nodeTexts(comp, ".notification ul li")).eql(["a", "b"]);
  });

  it("should render multiple notifications", () => {
    const comp = setupContainer(<Notifications/>, {notifications: [
      {type: "info", message: "info"},
      {type: "error", message: "fail"},
    ]});

    expect(nodeTexts(comp, ".notification p")).eql(["info", "fail"]);
  });

  it("should remove a single notif when the list has one", () => {
    const comp = setupContainer(<Notifications/>, {notifications: [
      {type: "info", message: "plop"},
    ]});

    click(comp, ".close");

    expect(findAll(comp, ".notification")).to.have.length.of(0);
  });

  it("should remove a single notif when the list has two", () => {
    const comp = setupContainer(<Notifications/>, {notifications: [
      {type: "info", message: "plop"},
      {type: "info", message: "plap"},
    ]});

    click(comp, ".close"); // first notification close button clicked

    expect(findAll(comp, ".notification")).to.have.length.of(1);
    expect(nodeTexts(comp, ".notification p")).eql(["plap"]);
  });
});
