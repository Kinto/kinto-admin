import { expect } from "chai";
import sinon from "sinon";
import KintoCollection from "kinto/lib/collection";
import React from "react";

import { setupContainer, nodeText, nodeExists, click } from "../test-utils";
import ResolvePage from "../../scripts/containers/ResolvePage";
import * as CollectionsActions from "../../scripts/actions/collections";
import * as CollectionActions from "../../scripts/actions/collection";
import * as ConflictsActions from "../../scripts/actions/conflicts";
import jsonConfig from "../../config/config.json";


describe("ResolvePage container", () => {
  var sandbox, comp;

  const conflicts = [
    {type: "incoming", local: {id1: 1, foo: 2}, remote: {id1: 1, foo: 3}}
  ];

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const props = {params: {name: "test"}};
    comp = setupContainer(<ResolvePage {...props} />);
    const { dispatch } = comp.store;
    dispatch(CollectionsActions.collectionsListReceived(jsonConfig.collections));
    dispatch(CollectionActions.select("tasks"));
    dispatch(ConflictsActions.reportConflicts(conflicts));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should render page title", () => {
    expect(nodeText(comp, "h1")).eql("Resolve incoming conflict");
  });

  describe("Local version picker", () => {
    it("should render the element", () => {
      expect(nodeExists(comp, ".picker-local")).eql(true);
    });

    it("should render a pick button", () => {
      expect(nodeText(comp, ".picker-local button")).eql("Pick local version");
    });

    it("should render the record version as JSON", () => {
      expect(nodeText(comp, ".picker-local pre"))
        .eql(JSON.stringify(conflicts[0].local, null, 2));
    });

    it("should resolve the conflict with the local version", () => {
      const resolve = sandbox.stub(KintoCollection.prototype, "resolve")
        .returns(Promise.resolve());

      click(comp, ".picker-local button");

      sinon.assert.calledWith(resolve, conflicts[0], conflicts[0].local);
    });
  });

  describe("Remote version picker", () => {
    it("should render the element", () => {
      expect(nodeExists(comp, ".picker-remote")).eql(true);
    });

    it("should render a pick button", () => {
      expect(nodeText(comp, ".picker-remote button")).eql("Pick remote version");
    });

    it("should render the record version as JSON", () => {
      expect(nodeText(comp, ".picker-remote pre"))
        .eql(JSON.stringify(conflicts[0].remote, null, 2));
    });

    it("should resolve the conflict with the remote version", () => {
      const resolve = sandbox.stub(KintoCollection.prototype, "resolve")
        .returns(Promise.resolve());

      click(comp, ".picker-remote button");

      sinon.assert.calledWith(resolve, conflicts[0], conflicts[0].remote);
    });
  });
});
