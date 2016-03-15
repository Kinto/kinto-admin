import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import KintoCollection from "kinto/lib/collection";

import { setupContainer, nodeText, nodeTexts, click } from "../test-utils";
import CollectionListPage from "../../scripts/containers/CollectionListPage";
import * as CollectionsActions from "../../scripts/actions/collections";
import * as CollectionActions from "../../scripts/actions/collection";
import defaultCollections from "../../config/config.json";


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
    const props = {params: {name: "tasks"}};
    const comp = setupContainer(<CollectionListPage {...props} />, {collection: {
      name: "tasks",
      records: []
    }});

    expect(nodeText(comp, "p:not(.actions)")).eql("This collection is empty.");
  });

  describe("Non-empty collection", () => {
    var comp;

    beforeEach(() => {
      const props = {params: {name: "tasks"}};
      comp = setupContainer(<CollectionListPage {...props} />);
      const { dispatch } = comp.store;
      dispatch(CollectionsActions.collectionsListReceived(defaultCollections));
      dispatch(CollectionActions.select("tasks"));
      dispatch(CollectionActions.loaded([
        {
          done: false,
          title: "task#1",
          last_modified: 100000000,
          _status: "synced"
        },
        {
          done: true,
          title: "task#2",
          last_modified: 200000000,
          _status: "updated"
        },
      ]));
    });

    it("should render collection title", () => {
      expect(nodeText(comp, "h1 > span")).eql("tasks");
    });

    it("should render current configured server URL", () => {
      const { server } = comp.store.getState().settings;
      expect(nodeText(comp, "h1 > em")).eql(server);
    });

    it("should render expected column headings", () => {
      expect(nodeTexts(comp, "thead th"))
        .eql(["Title", "Done?", "Last mod.", "Status", ""]);
    });

    it("should render record rows", () => {
      const rowTexts = n => nodeTexts(comp, `tbody tr:nth-child(${n}) td`);
      expect(rowTexts(1)).eql([
        "task#1",
        "false",
        "1970-01-02 03:46:40",
        "synced",
        "EditDelete",
      ]);
      expect(rowTexts(2)).eql([
        "task#2",
        "true",
        "1970-01-03 07:33:20",
        "updated",
        "EditDelete",
      ]);
    });

    describe("Collection action buttons", () => {
      it("should render collection action buttons", () => {
        expect(nodeTexts(comp, "p.actions button")).eql(
            ["Synchronize", "Add", "Synchronize", "Add"]);
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
