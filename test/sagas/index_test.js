import { configureAppStoreAndHistory } from "../../src/store/configureStore";
import * as routeSagas from "../../src/sagas/route";
import * as sessionSagas from "../../src/sagas/session";
import * as bucketSagas from "../../src/sagas/bucket";
import * as collectionSagas from "../../src/sagas/collection";
import * as routeActions from "../../src/actions/route";
import * as sessionActions from "../../src/actions/session";
import * as bucketActions from "../../src/actions/bucket";
import * as collectionActions from "../../src/actions/collection";

function expectSagaCalled(saga, action) {
  // Note: the rootSaga function is called by configureStore
  const { store } = configureAppStoreAndHistory();
  store.dispatch(action);
  expect(saga.mock.calls[0][0].name).toBe("bound getState");
  expect(saga.mock.calls[0][1]).toStrictEqual(action);
}

describe("root saga", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    // To match the behavior of older versions of redux-saga, we're ignoring
    // calls to console.error from these tests.
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("Route watchers registration", () => {
    it("should watch for the setup action", () => {
      const saga = jest.spyOn(routeSagas, "routeUpdated");
      const action = routeActions.routeUpdated();

      expectSagaCalled(saga, action);
    });
  });

  describe("Session watchers registration", () => {
    it("should watch for the setup action", () => {
      const saga = jest.spyOn(sessionSagas, "setupSession");
      const action = sessionActions.setupSession();

      expectSagaCalled(saga, action);
    });

    it("should watch for the listBuckets action", () => {
      const saga = jest.spyOn(sessionSagas, "listBuckets");
      const action = sessionActions.listBuckets();

      expectSagaCalled(saga, action);
    });
  });

  describe("Bucket watchers registration", () => {
    it("should watch for the createBucket action", () => {
      const saga = jest.spyOn(bucketSagas, "createBucket");
      const action = bucketActions.createBucket();

      expectSagaCalled(saga, action);
    });

    it("should watch for the updateBucket action", () => {
      const saga = jest.spyOn(bucketSagas, "updateBucket");
      const action = bucketActions.updateBucket();

      expectSagaCalled(saga, action);
    });

    it("should watch for the deleteBucket action", () => {
      const saga = jest.spyOn(bucketSagas, "deleteBucket");
      const action = bucketActions.deleteBucket();

      expectSagaCalled(saga, action);
    });

    it("should watch for the createCollection action", () => {
      const saga = jest.spyOn(bucketSagas, "createCollection");
      const action = bucketActions.createCollection();

      expectSagaCalled(saga, action);
    });

    it("should watch for the updateCollection action", () => {
      const saga = jest.spyOn(bucketSagas, "updateCollection");
      const action = bucketActions.updateCollection();

      expectSagaCalled(saga, action);
    });

    it("should watch for the deleteCollection action", () => {
      const saga = jest.spyOn(bucketSagas, "deleteCollection");
      const action = bucketActions.deleteCollection();

      expectSagaCalled(saga, action);
    });

    it("should watch for the listBucketCollections action", () => {
      const saga = jest.spyOn(bucketSagas, "listBucketCollections");
      const action = bucketActions.listBucketCollections();

      expectSagaCalled(saga, action);
    });

    it("should watch for the listHistory action", () => {
      const saga = jest.spyOn(bucketSagas, "listHistory");
      const action = bucketActions.listBucketHistory();

      expectSagaCalled(saga, action);
    });

    it("should watch for the listNextHistory action", () => {
      const saga = jest.spyOn(bucketSagas, "listNextHistory");
      const action = bucketActions.listBucketNextHistory();

      expectSagaCalled(saga, action);
    });
  });

  describe("Collection watchers registration", () => {
    it("should watch for the listRecords action", () => {
      const saga = jest.spyOn(collectionSagas, "listRecords");
      const action = collectionActions.listRecords();

      expectSagaCalled(saga, action);
    });

    it("should watch for the createRecord action", () => {
      const saga = jest.spyOn(collectionSagas, "createRecord");
      const action = collectionActions.createRecord();

      expectSagaCalled(saga, action);
    });

    it("should watch for the updateRecord action", () => {
      const saga = jest.spyOn(collectionSagas, "updateRecord");
      const action = collectionActions.updateRecord();

      expectSagaCalled(saga, action);
    });

    it("should watch for the deleteRecord action", () => {
      const saga = jest.spyOn(collectionSagas, "deleteRecord");
      const action = collectionActions.deleteRecord();

      expectSagaCalled(saga, action);
    });

    it("should watch for the deleteAttachment action", () => {
      const saga = jest.spyOn(collectionSagas, "deleteAttachment");
      const action = collectionActions.deleteAttachment();

      expectSagaCalled(saga, action);
    });

    it("should watch for the bulkCreateRecords action", () => {
      const saga = jest.spyOn(collectionSagas, "bulkCreateRecords");
      const action = collectionActions.bulkCreateRecords();

      expectSagaCalled(saga, action);
    });

    it("should watch for the listHistory action", () => {
      const saga = jest.spyOn(collectionSagas, "listHistory");
      const action = collectionActions.listCollectionHistory();

      expectSagaCalled(saga, action);
    });

    it("should watch for the listNextHistory action", () => {
      const saga = jest.spyOn(collectionSagas, "listNextHistory");
      const action = collectionActions.listCollectionNextHistory();

      expectSagaCalled(saga, action);
    });
  });
});
