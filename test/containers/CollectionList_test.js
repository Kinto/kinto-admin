import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import Kinto from "kinto";
import KintoCollection from "kinto/lib/collection";


const {MANUAL, CLIENT_WINS, SERVER_WINS} = Kinto.syncStrategy;

import { setupContainer, nodeText, nodeTexts, click } from "../test-utils";
import CollectionListPage from "../../scripts/containers/CollectionListPage";
import * as CollectionsActions from "../../scripts/actions/collections";
import * as CollectionActions from "../../scripts/actions/collection";
import jsonConfig from "../../config/config.json";


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

    expect(nodeText(comp, "p:not(.list-actions)")).eql("This collection is empty.");
  });

  describe("Non-empty collection", () => {
    var comp;

    beforeEach(() => {
      const props = {params: {name: "tasks"}};
      comp = setupContainer(<CollectionListPage {...props} />);
      const { dispatch } = comp.store;
      dispatch(CollectionsActions.collectionsListReceived(jsonConfig.collections));
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
      expect(nodeText(comp, "h1")).eql("tasks");
    });

    it("should render current configured server URL", () => {
      const { server } = comp.store.getState().settings;
      expect(nodeText(comp, ".server-info")).eql(server);
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
        "EditResolveDelete",
      ]);
      expect(rowTexts(2)).eql([
        "task#2",
        "true",
        "1970-01-03 07:33:20",
        "updated",
        "EditResolveDelete",
      ]);
    });

    describe("Collection action buttons", () => {
      let sync;

      beforeEach(() => {
        sync = sandbox.stub(KintoCollection.prototype, "sync")
          .returns(Promise.resolve({ok: true}));
      });

      it("should render collection action buttons", () => {
        expect(nodeTexts(comp, ".list-actions .btn-sync .caption")).eql(
            ["Synchronize", "Synchronize"]);
        expect(nodeTexts(comp, ".list-actions .btn-sync .label")).eql(
            ["MANUAL", "MANUAL"]);
      });

      it("should call kinto collection sync()", () => {
        click(comp, ".list-actions .btn-sync");

        sinon.assert.calledWithMatch(sync, {strategy: MANUAL});
      });

      it("should allow selecting the CLIENT_WINS sync strategy", () => {
        click(comp, ".list-actions .sync_client_wins");

        expect(nodeText(comp, ".list-actions .btn-sync .label"))
          .eql("CLIENT WINS");

        click(comp, ".list-actions .btn-sync");

        sinon.assert.calledWithMatch(sync, {strategy: CLIENT_WINS});
      });

      it("should allow selecting the SERVER_WINS sync strategy", () => {
        click(comp, ".list-actions .sync_server_wins");

        expect(nodeText(comp, ".list-actions .btn-sync .label"))
          .eql("SERVER WINS");

        click(comp, ".list-actions .btn-sync");

        sinon.assert.calledWithMatch(sync, {strategy: SERVER_WINS});
      });
    });
  });
});
