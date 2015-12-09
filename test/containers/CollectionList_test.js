import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import KintoCollection from "kinto/lib/collection";

import { setupContainer, nodeText, nodeTexts, click } from "../test-utils";
import CollectionListPage from "../../scripts/containers/CollectionListPage";
import * as CollectionActions from "../../scripts/actions/collection";



describe("CollectionListPage container", () => {
  var sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(CollectionActions, "load").returns({type: null});
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should render an empty collection", () => {
    const props = {params: {name: "addons"}};
    const comp = setupContainer(<CollectionListPage {...props} />, {collection: {
      name: "addons",
      records: []
    }});

    expect(nodeText(comp, "p")).eql("This collection is empty.");
  });

  describe("Non-empty collection", () => {
    var comp;

    beforeEach(() => {
      const props = {params: {name: "addons"}};
      comp = setupContainer(<CollectionListPage {...props} />);
      const { dispatch } = comp.store;
      dispatch(CollectionActions.select("addons"));
      dispatch(CollectionActions.loaded([
        {
          enabled: false,
          addonId: "addon#1",
          last_modified: 100000000,
          _status: "synced"
        },
        {
          enabled: true,
          addonId: "addon#2",
          last_modified: 200000000,
          _status: "updated"
        },
      ]));
    });

    it("should render collection title", () => {
      expect(nodeText(comp, "h1 > span")).eql("addons");
    });

    it("should render current configured server URL", () => {
      const { server } = comp.store.getState().settings;
      expect(nodeText(comp, "h1 > em")).eql(server);
    });

    it("should render expected column headings", () => {
      expect(nodeTexts(comp, "thead th"))
        .eql(["Enabled", "Addon id", "Last mod.", "Status", ""]);
    });

    it("should render record rows", () => {
      const rowTexts = n => nodeTexts(comp, `tbody tr:nth-child(${n}) td`);
      expect(rowTexts(1)).eql([
        "false",
        "addon#1",
        "1970-01-02 03:46:40",
        "synced",
        "EditDelete",
      ]);
      expect(rowTexts(2)).eql([
        "true",
        "addon#2",
        "1970-01-03 07:33:20",
        "updated",
        "EditDelete",
      ]);
    });

    describe("Collection action buttons", () => {
      it("should render collection action buttons", () => {
        expect(nodeTexts(comp, "p.actions button")).eql(["Synchronize", "Add"]);
      });

      it("should call kinto collection sync()", () => {
        const sync = sandbox.stub(KintoCollection.prototype, "sync")
          .returns(Promise.resolve({ok: true}));

        click(comp, "p.actions button.btn-sync");

        sinon.assert.called(sync);
      });
    });
  });
});
