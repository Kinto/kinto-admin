import { expect } from "chai";
import sinon from "sinon";

import configureStore from "../../scripts/store/configureStore";
import * as routeSagas from "../../scripts/sagas/route";
import * as sessionSagas from "../../scripts/sagas/session";
import * as bucketSagas from "../../scripts/sagas/bucket";
import * as collectionSagas from "../../scripts/sagas/collection";
import * as routeActions from "../../scripts/actions/route";
import * as sessionActions from "../../scripts/actions/session";
import * as bucketActions from "../../scripts/actions/bucket";
import * as collectionActions from "../../scripts/actions/collection";


function expectSagaCalled(saga, action) {
  // Note: the rootSaga function is called by configureStore
  configureStore().dispatch(action);

  expect(saga.firstCall.args[0].name).eql("bound getState");
  expect(saga.firstCall.args[1]).eql(action);
}

describe("root saga", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Route watchers registration", () => {
    it("should watch for the setup action", () => {
      const saga = sandbox.stub(routeSagas, "routeUpdated");
      const action = routeActions.routeUpdated();

      expectSagaCalled(saga, action);
    });
  });

  describe("Session watchers registration", () => {
    it("should watch for the setup action", () => {
      const saga = sandbox.stub(sessionSagas, "setupSession");
      const action = sessionActions.setup();

      expectSagaCalled(saga, action);
    });

    it("should watch for the listBuckets action", () => {
      const saga = sandbox.stub(sessionSagas, "listBuckets");
      const action = sessionActions.listBuckets();

      expectSagaCalled(saga, action);
    });

    it("should watch for the setupComplete action", () => {
      const saga = sandbox.stub(sessionSagas, "handleSessionRedirect");
      const action = sessionActions.setupComplete();

      expectSagaCalled(saga, action);
    });
  });

  describe("Bucket watchers registration", () => {
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

    it("should watch for the updateCollection action", () => {
      const saga = sandbox.stub(bucketSagas, "updateCollection");
      const action = bucketActions.updateCollection();

      expectSagaCalled(saga, action);
    });

    it("should watch for the deleteCollection action", () => {
      const saga = sandbox.stub(bucketSagas, "deleteCollection");
      const action = bucketActions.deleteCollection();

      expectSagaCalled(saga, action);
    });
  });

  describe("Collection watchers registration", () => {
    it("should watch for the listRecords action", () => {
      const saga = sandbox.stub(collectionSagas, "listRecords");
      const action = collectionActions.listRecords();

      expectSagaCalled(saga, action);
    });

    it("should watch for the createRecord action", () => {
      const saga = sandbox.stub(collectionSagas, "createRecord");
      const action = collectionActions.createRecord();

      expectSagaCalled(saga, action);
    });

    it("should watch for the updateRecord action", () => {
      const saga = sandbox.stub(collectionSagas, "updateRecord");
      const action = collectionActions.updateRecord();

      expectSagaCalled(saga, action);
    });

    it("should watch for the deleteRecord action", () => {
      const saga = sandbox.stub(collectionSagas, "deleteRecord");
      const action = collectionActions.deleteRecord();

      expectSagaCalled(saga, action);
    });

    it("should watch for the deleteAttachment action", () => {
      const saga = sandbox.stub(collectionSagas, "deleteAttachment");
      const action = collectionActions.deleteAttachment();

      expectSagaCalled(saga, action);
    });

    it("should watch for the bulkCreateRecords action", () => {
      const saga = sandbox.stub(collectionSagas, "bulkCreateRecords");
      const action = collectionActions.bulkCreateRecords();

      expectSagaCalled(saga, action);
    });
  });
});
