import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import KintoCollection from "kinto/lib/collection";

import {
  setupContainer,
  findOne,
  nodeText,
  nodeExists,
  SimulateAsync
} from "../test-utils";
import AddFormPage from "../../scripts/containers/AddFormPage";
import * as CollectionsActions from "../../scripts/actions/collections";
import * as CollectionActions from "../../scripts/actions/collection";
import jsonConfig from "../../config/config.json";


describe("AddFormPage container", () => {
  var sandbox, comp;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const props = {params: {name: "tasks"}};
    comp = setupContainer(<AddFormPage {...props} />);
    const { dispatch } = comp.store;
    dispatch(CollectionsActions.collectionsListReceived(jsonConfig.collections));
    dispatch(CollectionActions.select("tasks"));
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

  it("should submit record", () => {
    const create = sandbox.stub(KintoCollection.prototype, "create");

    return SimulateAsync().change(findOne(comp, "input[type=text]"), {
      target: {value: "sampleTitle"}
    })
      .then(() => {
        return SimulateAsync().submit(findOne(comp, "form"));
      })
      .then(() => {
        sinon.assert.calledWith(create, {
          done: false,
          title: "sampleTitle",
          description: "",
        });
      });
  });
});
