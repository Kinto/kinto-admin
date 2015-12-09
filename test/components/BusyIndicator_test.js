import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import { renderIntoDocument } from "react-addons-test-utils";

import BusyIndicator from "../../scripts/components/BusyIndicator";


describe("BusyIndicator component", () => {
  var sandbox, clock, comp;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    comp = renderIntoDocument(<BusyIndicator/>);
  });

  it("should render 3 dots at first", () => {
    expect(comp.state.symbol).eql("...");
  });

  it("should render 1 dot after 250ms", () => {
    clock.tick(250);
    expect(comp.state.symbol).eql(".");
  });

  it("should render 2 dots after 500ms", () => {
    clock.tick(500);
    expect(comp.state.symbol).eql("..");
  });

  it("should render 3 dots after 750ms", () => {
    clock.tick(750);
    expect(comp.state.symbol).eql("...");
  });
});
