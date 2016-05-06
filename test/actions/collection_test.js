import { expect } from "chai";
import sinon from "sinon";
import btoa from "btoa";
import KintoCollection from "kinto/lib/collection";
import adminConfig from "../../config/config.json";
import collectionReducer from "../../scripts/reducers/collection";
import collectionsReducer from "../../scripts/reducers/collections";
import settingsReducer from "../../scripts/reducers/settings";
import * as actions from "../../scripts/actions/collection";
import * as ConflictsActions from "../../scripts/actions/conflicts";
import * as NotificationsActions from "../../scripts/actions/notifications";
import * as ReduxRouter from "redux-simple-router";
import jsonConfig from "../../config/config.json";

describe("collection actions", () => {
  var sandbox, notifyError, markResolved, reportConflicts;

  const settings = settingsReducer(undefined, {type: null});

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    notifyError = sandbox.stub(NotificationsActions, "notifyError");
    markResolved = sandbox.stub(ConflictsActions, "markResolved");
    reportConflicts = sandbox.stub(ConflictsActions, "reportConflicts");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("configure()", () => {
    it("should retrieve the collection schema", () => {
      expect(actions.configure("tasks", adminConfig.collections.tasks.config).schema)
        .eql(adminConfig.collections.tasks.config.schema);
    });
  });

  describe("select()", () => {
    it("should select and configure a collection", () => {
      const collections = collectionsReducer(jsonConfig.collections, {type: null});
      const dispatch = sandbox.spy();
      const getState = () => ({collections, settings});

      actions.select("tasks")(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: actions.COLLECTION_READY,
        name: "tasks",
        schema: adminConfig.collections.tasks.config.schema,
        uiSchema: adminConfig.collections.tasks.config.uiSchema,
        config: collections.tasks.config,
      });
    });

    it("should dispatch an error on bad kinto configuration", () => {
      const collections = collectionsReducer(jsonConfig.collections, {type: null});
      const settings = {server: "http://bad.server/v999"};
      const dispatch = sandbox.spy();
      const getState = () => ({collections, settings});

      actions.select("tasks")(dispatch, getState);

      sinon.assert.calledWithMatch(notifyError,
        {message: "Cannot configure Kinto: Unsupported protocol version: v999" +
                  "; please check your settings."});
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

      actions.select("tasks")(dispatch, getState);
      expect(actions.kinto._options.remote).eql(settings.server);
      expect(actions.kinto._options.bucket).eql(settings.bucket);
      expect(actions.kinto._options.headers.Authorization)
        .eql("Basic " + btoa(settings.username + ":" + settings.password));
    });

    it("should redirect to home if collection is not configured", () => {
      sandbox.stub(ReduxRouter, "updatePath");
      const collections = collectionsReducer(jsonConfig.collections, {type: null});
      const dispatch = sandbox.spy();
      const getState = () => ({collections, settings});

      actions.select("blah")(dispatch, getState);

      sinon.assert.calledWithMatch(dispatch, {
        type: ReduxRouter.UPDATE_PATH,
        path: ""
      });
    });
  });

  describe("load()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "tasks"}, {type: null});
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
      const collections = collectionsReducer(jsonConfig.collections, {type: null});
      const collection = collectionReducer({name: "tasks"}, {type: null});
      dispatch = sandbox.spy();
      getState = () => ({
        collections,
        collection,
        settings,
      });
    });

    it("should select and load a named collection", () => {
      actions.selectAndLoad("tasks")(dispatch, getState);

      sinon.assert.calledWithMatch(dispatch, {
        type: actions.COLLECTION_READY,
        name: "tasks",
      });
      sinon.assert.calledWithMatch(dispatch, actions.load);
    });
  });

  describe("create()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "tasks"}, {type: null});
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
          type: ReduxRouter.UPDATE_PATH,
          path: "/collections/tasks",
        });
        done();
      });
    });
  });

  describe("bulkCreate()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "tasks"}, {type: null});
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

      actions.bulkCreate([{foo: "bar"}, {foo: "bar2"}])(dispatch, getState);

      sinon.assert.calledWith(create, {foo: "bar"});
      sinon.assert.calledWith(create, {foo: "bar2"});
    });

    it("should clear notifications", () => {
      sandbox.stub(KintoCollection.prototype, "create").returns(
        Promise.resolve());

      actions.bulkCreate([{foo: "bar"}])(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: NotificationsActions.NOTIFICATION_CLEAR,
      });
    });

    it("should redirect to collection URL", (done) => {
      sandbox.stub(KintoCollection.prototype, "create").returns(
        Promise.resolve());

      actions.bulkCreate([{foo: "bar"}])(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWithMatch(dispatch, {
          type: ReduxRouter.UPDATE_PATH,
          path: "/collections/tasks",
        });
        done();
      });
    });
  });

  describe("update()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "tasks"}, {type: null});
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
          type: ReduxRouter.UPDATE_PATH,
          path: "/collections/tasks",
        });
        done();
      });
    });
  });

  describe("resolve()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "tasks"}, {type: null});
      dispatch = sandbox.spy();
      getState = () => ({
        collections,
        collection,
      });
    });

    it("should resolve the conflict", () => {
      const resolve = sandbox.stub(KintoCollection.prototype, "resolve").returns(
        Promise.resolve());
      const conflict = {local: {}, remote: {}};

      actions.resolve(conflict, {foo: "bar"})(dispatch, getState);

      sinon.assert.calledWith(resolve, conflict, {foo: "bar"});
    });

    it("should clear notifications", () => {
      sandbox.stub(KintoCollection.prototype, "resolve").returns(
        Promise.resolve());
      const conflict = {local: {}, remote: {}};

      actions.resolve(conflict, {foo: "bar"})(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: NotificationsActions.NOTIFICATION_CLEAR,
      });
    });

    it("should mark the conflict as resolved", (done) => {
      sandbox.stub(KintoCollection.prototype, "resolve").returns(
        Promise.resolve());
      const conflict = {local: {}, remote: {}};

      actions.resolve(conflict, {id: 42, foo: "bar"})(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWith(markResolved, 42);
        done();
      });
    });

    it("should redirect to collection URL", (done) => {
      sandbox.stub(KintoCollection.prototype, "resolve").returns(
        Promise.resolve());
      const conflict = {local: {}, remote: {}};

      actions.resolve(conflict, {foo: "bar"})(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWithMatch(dispatch, {
          type: ReduxRouter.UPDATE_PATH,
          path: "/collections/tasks",
        });
        done();
      });
    });
  });

  describe("deleteRecord()", () => {
    var dispatch, getState;

    beforeEach(() => {
      const collections = collectionsReducer(undefined, {type: null});
      const collection = collectionReducer({name: "tasks"}, {type: null});
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
      const collection = collectionReducer({name: "tasks"}, {type: null});
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

    it("should report synchronization conflicts", (done) => {
      const conflicts = [
        {type: "incoming", local: {id: 1}, remote: {id: 1}},
        {type: "incoming", local: {id: 2}, remote: {id: 2}},
      ];
      sandbox.stub(KintoCollection.prototype, "sync")
        .returns(Promise.resolve({
          ok: false,
          conflicts,
          errors: [],
        }));

      actions.sync()(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWithMatch(reportConflicts, conflicts);
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
      const collection = collectionReducer({name: "tasks"}, {type: null});
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
