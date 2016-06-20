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


describe("root saga", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Watchers registration", function() {
    let registered;

    beforeEach(() => {
      registered = rootSaga().next().value;
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

    it("should register the watchBucketCreate watcher", () => {
      expect(registered).to.include(fork(bucketSagas.watchBucketCreate));
    });

    it("should register the watchBucketUpdate watcher", () => {
      expect(registered).to.include(fork(bucketSagas.watchBucketUpdate));
    });

    it("should register the watchBucketDelete watcher", () => {
      expect(registered).to.include(fork(bucketSagas.watchBucketDelete));
    });

    it("should register the watchCollectionCreate watcher", () => {
      expect(registered).to.include(fork(bucketSagas.watchCollectionCreate));
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

  describe("Conditional watchers", () => {
    it("should reset the watchRecordCreate watcher on new session info", () => {
      const watchRecordCreate = sandbox.stub(collectionSagas, "watchRecordCreate");
      const store = configureStore();
      const action = {type: SESSION_SERVERINFO_SUCCESS};

      store.dispatch(action);

      sinon.assert.calledWithExactly(watchRecordCreate, action);
    });

    it("should reset the watchRecordUpdate watcher on new session info", () => {
      const watchRecordUpdate = sandbox.stub(collectionSagas, "watchRecordUpdate");
      const store = configureStore();
      const action = {type: SESSION_SERVERINFO_SUCCESS};

      store.dispatch(action);

      sinon.assert.calledWithExactly(watchRecordUpdate, action);
    });
  });
});
