import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import KintoCollection from "kinto/lib/collection";
import { Simulate } from "react-addons-test-utils";

import { setupContainer, findOne, nodeText, nodeExists } from "../test-utils";
import EditFormPage from "../../scripts/containers/EditFormPage";
import * as CollectionActions from "../../scripts/actions/collection";
import * as FormActions from "../../scripts/actions/form";


describe("EditFormPage container", () => {
  var sandbox, comp;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const props = {params: {name: "addons"}};
    comp = setupContainer(<EditFormPage {...props} />);
    const { dispatch } = comp.store;
    dispatch(CollectionActions.select("addons"));
    dispatch(FormActions.recordLoaded({addonId: "existingAddondId"}));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should render page title", () => {
    expect(nodeText(comp, "h1")).eql("addons");
  });

  it("should render a form", () => {
    expect(nodeExists(comp, "form.generic-form")).eql(true);
  });

  it("should render the form loaded with record info", () => {
    expect(findOne(comp, "input[type=text]").value).eql("existingAddondId");
  });

  it("should submit record", () => {
    const update = sandbox.stub(KintoCollection.prototype, "update");

    Simulate.change(findOne(comp, "input[type=text]"), {
      target: {value: "modifiedAddonId"}
    });
    Simulate.submit(findOne(comp, "form"));

    sinon.assert.calledWith(update, {addonId: "modifiedAddonId"});
  });
});
