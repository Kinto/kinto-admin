import { expect } from "chai";
import sinon from "sinon";
import btoa from "btoa";
import KintoCollection from "kinto/lib/collection";
import kwacConfig from "../../config/kwac-config.json";
import collectionReducer from "../../scripts/reducers/collection";
import collectionsReducer from "../../scripts/reducers/collections";
import settingsReducer from "../../scripts/reducers/settings";
import * as actions from "../../scripts/actions/collection";
import * as NotificationsActions from "../../scripts/actions/notifications";
import { UPDATE_PATH } from "redux-simple-router";

describe("collection actions", () => {
  var sandbox, notifyError;

  const settings = settingsReducer(undefined, {type: null});

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    notifyError = sandbox.stub(NotificationsActions, "notifyError");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("configure()", () => {
    it("should retrieve the collection schema", () => {
      expect(actions.configure("addons", kwacConfig.addons.config).schema)
        .eql(kwacConfig.addons.config.schema);
    });
  });

  describe("select()", () => {
    it("should select and configure a collection", () => {
      const collections = collectionsReducer(undefined, {type: null});
      const dispatch = sandbox.spy();
      const getState = () => ({collections, settings});

      actions.select("addons")(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: actions.COLLECTION_READY,
        name: "addons",
        schema: kwacConfig.addons.config.schema,
        config: collections.addons.config,
      });
    });

    it("should dispatch an error on bad kinto configuration", () => {
      const collections = collectionsReducer(undefined, {type: null});
      const settings = {server: "http://bad.server/v999"};
      const dispatch = sandbox.spy();
      const getState = () => ({collections, settings});

      actions.select("addons")(dispatch, getState);

      sinon.assert.calledWithMatch(notifyError,
        {message: "Cannot configure Kinto: Unsupported protocol version: v999" +
                  "; please check your settings."});
    });

    it("should dispatch an error on collection unavailable", () => {
      const collections = {};
      const dispatch = sandbox.spy();
      const getState = () => ({collections, settings});

      actions.select("foo")(dispatch, getState);

      sinon.assert.calledWithMatch(notifyError,
        {message: "Collection \"foo\" is not available."});
    });

    it("should dispatch an error on unconfigured collection", () => {
      const collections = {
        unconfigured: {
          name: "unconfigured",
          synced: false,
        }
      };
      const dispatch = sandbox.spy();
      const getState = () => ({collections, settings});

      actions.select("unconfigured")(dispatch, getState);

      sinon.assert.calledWithMatch(notifyError,
        {message: `The "unconfigured" collection is not configured.`});
    });

    it("should configure the kinto instance with state settings", () => {
      const collections = collectionsReducer(undefined, {type: null});
      const dispatch = sandbox.spy();
      const getState = () => ({collections, settings});

      actions.select("addons")(dispatch, getState);
      expect(actions.kinto._options.remote).eql(settings.server);
      expect(actions.kinto._options.bucket).eql(settings.bucket);
      expect(actions.kinto._options.headers.Authorization)
        .eql("Basic " + btoa(settings.username + ":" + settings.password));
    });
  });

  describe("load()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "addons"}, {type: null});
      dispatch = sandbox.spy();
      getState = () => ({
        collections,
        collection,
      });
    });

    it("should mark the collection as busy", () => {
      actions.load()(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: actions.COLLECTION_BUSY,
        flag: true,
      });
    });

    it("should load the collection", (done) => {
      sandbox.stub(KintoCollection.prototype, "list").returns(
        Promise.resolve({data: [{a: 1}]}));

      actions.load()(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWith(dispatch, {
          type: actions.COLLECTION_LOADED,
          records: [{a: 1}],
        });
        done();
      });
    });
  });

  describe("selectAndLoad()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "addons"}, {type: null});
      dispatch = sandbox.spy();
      getState = () => ({
        collections,
        collection,
        settings,
      });
    });

    it("should select and load a named collection", () => {
      actions.selectAndLoad("certificates")(dispatch, getState);

      sinon.assert.calledWithMatch(dispatch, {
        type: actions.COLLECTION_READY,
        name: "certificates",
      });
      sinon.assert.calledWithMatch(dispatch, actions.load);
    });
  });

  describe("create()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "addons"}, {type: null});
      dispatch = sandbox.spy();
      getState = () => ({
        collections,
        collection,
      });
    });

    it("should mark the collection as busy", () => {
      actions.load()(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: actions.COLLECTION_BUSY,
        flag: true,
      });
    });

    it("should create the record", () => {
      const create = sandbox.stub(KintoCollection.prototype, "create").returns(
        Promise.resolve());

      actions.create({foo: "bar"})(dispatch, getState);

      sinon.assert.calledWith(create, {foo: "bar"});
    });

    it("should clear notifications", () => {
      sandbox.stub(KintoCollection.prototype, "create").returns(
        Promise.resolve());

      actions.create({foo: "bar"})(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: NotificationsActions.NOTIFICATION_CLEAR,
      });
    });

    it("should redirect to collection URL", (done) => {
      sandbox.stub(KintoCollection.prototype, "create").returns(
        Promise.resolve());

      actions.create({foo: "bar"})(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWithMatch(dispatch, {
          type: UPDATE_PATH,
          path: "/collections/addons",
        });
        done();
      });
    });
  });

  describe("update()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "addons"}, {type: null});
      dispatch = sandbox.spy();
      getState = () => ({
        collections,
        collection,
      });
    });

    it("should mark the collection as busy", () => {
      actions.load()(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: actions.COLLECTION_BUSY,
        flag: true,
      });
    });

    it("should update the record", () => {
      const update = sandbox.stub(KintoCollection.prototype, "update").returns(
        Promise.resolve());

      actions.update({foo: "bar"})(dispatch, getState);

      sinon.assert.calledWith(update, {foo: "bar"});
    });

    it("should clear notifications", () => {
      sandbox.stub(KintoCollection.prototype, "update").returns(
        Promise.resolve());

      actions.update({foo: "bar"})(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: NotificationsActions.NOTIFICATION_CLEAR,
      });
    });

    it("should redirect to collection URL", (done) => {
      sandbox.stub(KintoCollection.prototype, "create").returns(
        Promise.resolve());

      actions.create({foo: "bar"})(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWithMatch(dispatch, {
          type: UPDATE_PATH,
          path: "/collections/addons",
        });
        done();
      });
    });
  });

  describe("deleteRecord()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "addons"}, {type: null});
      dispatch = sandbox.spy();
      getState = () => ({
        collections,
        collection,
      });
    });

    it("should mark the collection as busy", () => {
      actions.load()(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: actions.COLLECTION_BUSY,
        flag: true,
      });
    });

    it("should deleteRecord the record", () => {
      const deleteRecord = sandbox.stub(KintoCollection.prototype, "delete")
        .returns(Promise.resolve());

      actions.deleteRecord(42)(dispatch, getState);

      sinon.assert.calledWith(deleteRecord, 42);
    });

    it("should clear notifications", () => {
      sandbox.stub(KintoCollection.prototype, "delete").returns(
        Promise.resolve());

      actions.deleteRecord(42)(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: NotificationsActions.NOTIFICATION_CLEAR,
      });
    });
  });

  describe("sync()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "addons"}, {type: null});
      dispatch = sandbox.spy();
      getState = () => ({
        collections,
        collection,
      });
    });

    it("should mark the collection as busy", () => {
      actions.load()(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: actions.COLLECTION_BUSY,
        flag: true,
      });
    });

    it("should sync the collection", () => {
      const sync = sandbox.stub(KintoCollection.prototype, "sync")
        .returns(Promise.resolve());

      actions.sync()(dispatch, getState);

      sinon.assert.calledOnce(sync);
    });

    it("should notify from synchronization errors", (done) => {
      sandbox.stub(KintoCollection.prototype, "sync")
        .returns(Promise.resolve({
          ok: false,
          errors: [
            {type: "incoming", message: "error1"},
            {type: "incoming", message: "error2"},
          ],
          conflicts: []
        }));

      actions.sync()(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWithMatch(NotificationsActions.notifyError, {
          message: "Synchronization failed.",
          details: ["incoming error: error1", "incoming error: error2"]
        });
        done();
      });
    });

    it("should notify from synchronization conflicts", (done) => {
      sandbox.stub(KintoCollection.prototype, "sync")
        .returns(Promise.resolve({
          ok: false,
          conflicts: [
            {type: "incoming", local: {id: 1}, remote: {id: 1}},
            {type: "incoming", local: {id: 2}, remote: {id: 2}},
          ],
          errors: [],
        }));

      actions.sync()(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWithMatch(NotificationsActions.notifyError, {
          message: "Synchronization failed.",
          details: ["incoming conflict: 1", "incoming conflict: 2"]
        });
        done();
      });
    });

    it("should clear notifications", () => {
      sandbox.stub(KintoCollection.prototype, "sync").returns(
        Promise.resolve());

      actions.sync()(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: NotificationsActions.NOTIFICATION_CLEAR,
      });
    });
  });

  describe("resetSync()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "addons"}, {type: null});
      dispatch = sandbox.spy();
      getState = () => ({
        collections,
        collection,
      });
    });

    it("should mark the collection as busy", () => {
      actions.load()(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: actions.COLLECTION_BUSY,
        flag: true,
      });
    });

    it("should resetSync the record", () => {
      const resetSyncStatus = sandbox.stub(
        KintoCollection.prototype, "resetSyncStatus")
        .returns(Promise.resolve());

      actions.resetSync()(dispatch, getState);

      sinon.assert.calledOnce(resetSyncStatus);
    });

    it("should clear notifications", () => {
      sandbox.stub(KintoCollection.prototype, "resetSyncStatus").returns(
        Promise.resolve());

      actions.resetSync()(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: NotificationsActions.NOTIFICATION_CLEAR,
      });
    });
  });
});
