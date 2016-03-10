import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import KintoCollection from "kinto/lib/collection";
import { Simulate } from "react-addons-test-utils";

import { setupContainer, findOne, nodeText, nodeExists } from "../test-utils";
import EditFormPage from "../../scripts/containers/EditFormPage";
import * as CollectionActions from "../../scripts/actions/collection";
import * as FormActions from "../../scripts/actions/form";
import defaultCollections from "../../config/config.json";

describe("EditFormPage container", () => {
  var sandbox, comp;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const props = {params: {name: "tasks"}};
    comp = setupContainer(<EditFormPage {...props} />, {
      collections: defaultCollections
    });
    const { dispatch } = comp.store;
    dispatch(CollectionActions.select("tasks"));
    dispatch(FormActions.recordLoaded({title: "existingTitle"}));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should render page title", () => {
    expect(nodeText(comp, "h1")).eql("tasks");
  });

  it("should render a form", () => {
    expect(nodeExists(comp, "form.rjsf")).eql(true);
  });

  it("should render the form loaded with record info", () => {
    expect(findOne(comp, "input[type=text]").value).eql("existingTitle");
  });

  it("should submit record", () => {
    const update = sandbox.stub(KintoCollection.prototype, "update");

    Simulate.change(findOne(comp, "input[type=text]"), {
      target: {value: "modifiedTitle"}
    });
    Simulate.submit(findOne(comp, "form"));

    sinon.assert.calledWith(update, {title: "modifiedTitle"});
  });
});
