import { expect } from "chai";
import sinon from "sinon";
import { fork } from "redux-saga/effects";

import { SESSION_SERVERINFO_SUCCESS } from "../../scripts/constants";
const routeSagas = require("../../scripts/sagas/route");
const sessionSagas = require("../../scripts/sagas/session");
const bucketSagas = require("../../scripts/sagas/bucket");
const collectionSagas = require("../../scripts/sagas/collection");
import rootSaga from "../../scripts/sagas";
import configureStore from "../../scripts/store/configureStore";

import * as bucketActions from "../../scripts/actions/bucket";


describe("root saga", () => {
  let sandbox, getState;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    getState = () => {};
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Watchers registration", function() {
    let registered;

    beforeEach(() => {
      registered = rootSaga(getState).next().value;
    });

    it("should register the watchRecordDelete watcher", () => {
      expect(registered).to.include(fork(sessionSagas.watchSessionSetup));
    });

    it("should register the watchRecordDelete watcher", () => {
      expect(registered).to.include(fork(sessionSagas.watchSessionSetupComplete));
    });

    it("should register the watchRecordDelete watcher", () => {
      expect(registered).to.include(fork(sessionSagas.watchSessionLogout));
    });

    it("should register the watchRecordDelete watcher", () => {
      expect(registered).to.include(fork(sessionSagas.watchSessionBuckets));
    });

    it("should register the watchRouteUpdated watcher", () => {
      expect(registered).to.include(fork(routeSagas.watchRouteUpdated));
    });

    it("should register the watchCollectionUpdate watcher", () => {
      expect(registered).to.include(fork(bucketSagas.watchCollectionUpdate));
    });

    it("should register the watchCollectionDelete watcher", () => {
      expect(registered).to.include(fork(bucketSagas.watchCollectionDelete));
    });

    it("should register the watchListRecords watcher", () => {
      expect(registered).to.include(fork(collectionSagas.watchListRecords));
    });

    it("should register the watchRecordUpdate watcher", () => {
      expect(registered).to.include(fork(collectionSagas.watchRecordUpdate, getState));
    });

    it("should register the watchRecordDelete watcher", () => {
      expect(registered).to.include(fork(collectionSagas.watchRecordDelete));
    });

    it("should register the watchBulkCreateRecords watcher", () => {
      expect(registered).to.include(fork(collectionSagas.watchBulkCreateRecords));
    });

    it("should register the watchAttachmentDelete watcher", () => {
      expect(registered).to.include(fork(collectionSagas.watchAttachmentDelete));
    });
  });

  describe("Bucket watchers registration", () => {
    function expectSagaCalled(saga, action) {
      configureStore().dispatch(action);

      expect(saga.firstCall.args[0].name).eql("bound getState");
      expect(saga.firstCall.args[1]).eql(action);
    }

    it("should watch for the createBucket action", () => {
      const saga = sandbox.stub(bucketSagas, "createBucket");
      const action = bucketActions.createBucket();

      expectSagaCalled(saga, action);
    });

    it("should watch for the updateBucket action", () => {
      const saga = sandbox.stub(bucketSagas, "updateBucket");
      const action = bucketActions.updateBucket();

      expectSagaCalled(saga, action);
    });

    it("should watch for the deleteBucket action", () => {
      const saga = sandbox.stub(bucketSagas, "deleteBucket");
      const action = bucketActions.deleteBucket();

      expectSagaCalled(saga, action);
    });

    it("should watch for the createCollection action", () => {
      const saga = sandbox.stub(bucketSagas, "createCollection");
      const action = bucketActions.createCollection();

      expectSagaCalled(saga, action);
    });
  });

  describe("Conditional watchers", () => {
    it("should reset the watchRecordCreate watcher on new session info", () => {
      const watchRecordCreate = sandbox.stub(collectionSagas, "watchRecordCreate");
      const store = configureStore();
      const action = {type: SESSION_SERVERINFO_SUCCESS};

      store.dispatch(action);

      sinon.assert.calledWithExactly(watchRecordCreate, action);
    });
  });
});
