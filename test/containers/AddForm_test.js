import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import KintoCollection from "kinto/lib/collection";
import { Simulate } from "react-addons-test-utils";

import { setupContainer, findOne, nodeText, nodeExists } from "../test-utils";
import AddFormPage from "../../scripts/containers/AddFormPage";
import * as CollectionActions from "../../scripts/actions/collection";


describe("AddFormPage container", () => {
  var sandbox, comp;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const props = {params: {name: "tasks"}};
    comp = setupContainer(<AddFormPage {...props} />);
    const { dispatch } = comp.store;
    dispatch(CollectionActions.select("tasks"));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should render page title", () => {
    expect(nodeText(comp, "h1")).eql("tasks");
  });

  it("should render a form", () => {
    expect(nodeExists(comp, "form.generic-form")).eql(true);
  });

  it("should submit record", () => {
    const create = sandbox.stub(KintoCollection.prototype, "create");

    Simulate.change(findOne(comp, "input[type=text]"), {
      target: {value: "sampleTitle"}
    });
    Simulate.submit(findOne(comp, "form"));

    sinon.assert.calledWith(create, {title: "sampleTitle"});
  });
});
