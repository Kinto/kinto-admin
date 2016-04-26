import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import KintoCollection from "kinto/lib/collection";
import { Simulate } from "react-addons-test-utils";

import { setupContainer, findOne, findAll, nodeText, nodeExists } from "../test-utils";
import BulkFormPage from "../../scripts/containers/BulkFormPage";
import * as CollectionsActions from "../../scripts/actions/collections";
import * as CollectionActions from "../../scripts/actions/collection";
import jsonConfig from "../../config/config.json";


describe("BulkFormPage container", () => {
  var sandbox, comp;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const props = {params: {name: "tasks"}};
    comp = setupContainer(<BulkFormPage {...props} />);
    const { dispatch } = comp.store;
    dispatch(CollectionsActions.collectionsListReceived(jsonConfig.collections));
    dispatch(CollectionActions.select("tasks"));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should render page title", () => {
    expect(nodeText(comp, "h1")).eql("Bulk tasks creation");
  });

  it("should render a form", () => {
    expect(nodeExists(comp, "form.rjsf")).eql(true);
  });

  it("should submit records", () => {
    const create = sandbox.stub(KintoCollection.prototype, "create");

    Simulate.click(findOne(comp, ".array-item-add button"));
    Simulate.change(findAll(comp, "input[type=text]")[0], {
      target: {value: "sampleTitle1"}
    });
    Simulate.click(findOne(comp, ".array-item-add button"));
    Simulate.change(findAll(comp, "input[type=text]")[1], {
      target: {value: "sampleTitle2"}
    });
    Simulate.submit(findOne(comp, "form"));

    sinon.assert.calledTwice(create);
    sinon.assert.calledWith(create,
      {done: false, title: "sampleTitle1", description: ""});
    sinon.assert.calledWith(create,
      {done: false, title: "sampleTitle2", description: ""});
  });
});
