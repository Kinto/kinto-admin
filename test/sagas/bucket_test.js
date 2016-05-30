import { expect } from "chai";
import { push as updatePath } from "react-router-redux";
import { take, fork, put, call } from "redux-saga/effects";

import {
  BUCKET_CREATE_REQUEST,
  BUCKET_UPDATE_REQUEST,
  BUCKET_DELETE_REQUEST,
  COLLECTION_LOAD_REQUEST,
  COLLECTION_CREATE_REQUEST,
  COLLECTION_UPDATE_REQUEST,
  COLLECTION_DELETE_REQUEST,
} from "../../scripts/constants";
import { notifyError, notifySuccess } from "../../scripts/actions/notifications";
import * as sessionActions from "../../scripts/actions/session";
import * as collectionActions from "../../scripts/actions/collection";
import * as actions from "../../scripts/actions/bucket";
import { listBuckets } from "../../scripts/sagas/session";
import * as saga from "../../scripts/sagas/bucket";
import { setClient } from "../../scripts/client";


const collectionData = {
  schema: {},
  uiSchema: {},
  displayFields: [],
};

describe("bucket sagas", () => {
  describe("createBucket()", () => {
    describe("Success", () => {
      let client, createBucket;

      before(() => {
        client = setClient({createBucket() {}});
        createBucket = saga.createBucket("bucket", {a: 1});
      });

      it("should mark the current session as busy", () => {
        expect(createBucket.next().value)
          .eql(put(sessionActions.sessionBusy(true)));
      });

      it("should fetch collection attributes", () => {
        expect(createBucket.next().value)
          .eql(call([client, client.createBucket], "bucket", {data: {a: 1}}));
      });

      it("should reload the list of buckets/collections", () => {
        expect(createBucket.next().value)
          .eql(call(listBuckets));
      });

      it("should update the route path", () => {
        expect(createBucket.next().value)
          .eql(put(updatePath("/buckets/bucket/edit")));
      });

      it("should dispatch a notification", () => {
        expect(createBucket.next().value)
          .eql(put(notifySuccess("Bucket created.")));
      });

      it("should unmark the current session as busy", () => {
        expect(createBucket.next().value)
          .eql(put(sessionActions.sessionBusy(false)));
      });
    });

    describe("Failure", () => {
      let createBucket;

      before(() => {
        createBucket = saga.createBucket("bucket");
        createBucket.next();
        createBucket.next();
      });

      it("should dispatch an error notification action", () => {
        expect(createBucket.throw("error").value)
          .eql(put(notifyError("error", {clear: true})));
      });

      it("should unmark the current session as busy", () => {
        expect(createBucket.next().value)
          .eql(put(sessionActions.sessionBusy(false)));
      });
    });
  });

  describe("updateBucket()", () => {
    describe("Success", () => {
      let bucket, updateBucket;

      before(() => {
        bucket = {setData(){}};
        setClient({bucket(){return bucket;}});
        updateBucket = saga.updateBucket("bucket", {a: 1});
      });

      it("should mark the current session as busy", () => {
        expect(updateBucket.next().value)
          .eql(put(sessionActions.sessionBusy(true)));
      });

      it("should fetch bucket attributes", () => {
        expect(updateBucket.next().value)
          .eql(call([bucket, bucket.setData], {a: 1}));
      });

      it("should reload the list of buckets/collections", () => {
        expect(updateBucket.next().value)
          .eql(call(saga.loadBucket, "bucket"));
      });

      it("should dispatch a notification", () => {
        expect(updateBucket.next().value)
          .eql(put(notifySuccess("Bucket updated.")));
      });

      it("should unmark the current session as busy", () => {
        expect(updateBucket.next().value)
          .eql(put(sessionActions.sessionBusy(false)));
      });
    });

    describe("Failure", () => {
      let updateBucket;

      before(() => {
        updateBucket = saga.updateBucket("bucket");
        updateBucket.next();
        updateBucket.next();
      });

      it("should dispatch an error notification action", () => {
        expect(updateBucket.throw("error").value)
          .eql(put(notifyError("error", {clear: true})));
      });

      it("should unmark the current session as busy", () => {
        expect(updateBucket.next().value)
          .eql(put(sessionActions.sessionBusy(false)));
      });
    });
  });

  describe("deleteBucket()", () => {
    describe("Success", () => {
      let client, deleteBucket;

      before(() => {
        client = setClient({deleteBucket() {}});
        deleteBucket = saga.deleteBucket("bucket");
      });

      it("should mark the current session as busy", () => {
        expect(deleteBucket.next().value)
          .eql(put(sessionActions.sessionBusy(true)));
      });

      it("should fetch collection attributes", () => {
        expect(deleteBucket.next().value)
          .eql(call([client, client.deleteBucket], "bucket"));
      });

      it("should reload the list of buckets/collections", () => {
        expect(deleteBucket.next().value)
          .eql(call(listBuckets));
      });

      it("should update the route path", () => {
        expect(deleteBucket.next().value)
          .eql(put(updatePath("/")));
      });

      it("should dispatch a notification", () => {
        expect(deleteBucket.next().value)
          .eql(put(notifySuccess("Bucket deleted.")));
      });

      it("should unmark the current collection as busy", () => {
        expect(deleteBucket.next().value)
          .eql(put(sessionActions.sessionBusy(false)));
      });
    });

    describe("Failure", () => {
      let deleteBucket;

      before(() => {
        deleteBucket = saga.deleteBucket("bucket");
        deleteBucket.next();
      });

      it("should dispatch an error notification action", () => {
        expect(deleteBucket.throw("error").value)
          .eql(put(notifyError("error", {clear: true})));
      });

      it("should unmark the current collection as busy", () => {
        expect(deleteBucket.next().value)
          .eql(put(sessionActions.sessionBusy(false)));
      });
    });
  });

  describe("loadCollection()", () => {
    describe("Success", () => {
      let bucket, collection, loadCollection;

      before(() => {
        collection = {getData() {}};
        bucket = {collection() {return collection;}};
        setClient({bucket() {return bucket;}});
        loadCollection = saga.loadCollection("bucket", "collection");
      });

      it("should mark the current collection as busy", () => {
        expect(loadCollection.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should fetch collection attributes", () => {
        expect(loadCollection.next().value)
          .eql(call([collection, collection.getData]));
      });

      it("should dispatch the collectionLoadSuccess action", () => {
        expect(loadCollection.next(collectionData).value)
          .eql(put(collectionActions.collectionLoadSuccess({
            ...collectionData,
            bucket: "bucket",
          })));
      });

      it("should unmark the current collection as busy", () => {
        expect(loadCollection.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });

    describe("Failure", () => {
      let loadCollection;

      before(() => {
        loadCollection = saga.loadCollection("bucket", "collection");
        loadCollection.next();
        loadCollection.next();
      });

      it("should dispatch an error notification action", () => {
        expect(loadCollection.throw("error").value)
          .eql(put(notifyError("error", {clear: true})));
      });

      it("should unmark the current collection as busy", () => {
        expect(loadCollection.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });
  });

  describe("createCollection()", () => {
    describe("Success", () => {
      let bucket, createCollection;

      before(() => {
        bucket = {createCollection() {}};
        setClient({bucket() {return bucket;}});
        createCollection = saga.createCollection("bucket", {
          ...collectionData,
          name: "collection",
        });
      });

      it("should post the collection data", () => {
        expect(createCollection.next().value)
          .eql(call([bucket, bucket.createCollection], "collection", {
            data: collectionData
          }));
      });

      it("should update the route path", () => {
        expect(createCollection.next().value)
          .eql(put(updatePath("/buckets/bucket/collections/collection")));
      });

      it("should dispatch a notification", () => {
        expect(createCollection.next().value)
          .eql(put(notifySuccess("Collection created.")));
      });

      it("should reload the list of buckets/collections", () => {
        expect(createCollection.next().value)
          .eql(call(listBuckets));
      });
    });

    describe("Failure", () => {
      let createCollection;

      before(() => {
        const bucket = {createCollection() {}};
        setClient({bucket() {return bucket;}});
        createCollection = saga.createCollection("bucket", {
          ...collectionData,
          name: "collection",
        });
        createCollection.next();
      });

      it("should dispatch an error notification action", () => {
        expect(createCollection.throw("error").value)
          .eql(put(notifyError("error", {clear: true})));
      });
    });
  });

  describe("updateCollection()", () => {
    describe("Success", () => {
      let bucket, collection, updateCollection;

      before(() => {
        collection = {setData() {}};
        bucket = {collection() {return collection;}};
        setClient({bucket() {return bucket;}});
        updateCollection = saga.updateCollection(
          "bucket", "collection", collectionData);
      });

      it("should post the collection data", () => {
        expect(updateCollection.next().value)
          .eql(call([collection, collection.setData], collectionData));
      });

      it("should dispatch the collectionLoadSuccess action", () => {
        expect(updateCollection.next({data: collectionData}).value)
          .eql(put(collectionActions.collectionLoadSuccess({
            ...collectionData,
            bucket: "bucket",
          })));
      });

      it("should dispatch a notification", () => {
        expect(updateCollection.next().value)
          .eql(put(notifySuccess("Collection properties updated.")));
      });
    });

    describe("Failure", () => {
      it("should dispatch an error notification action", () => {
        const updateCollection = saga.updateCollection(
          "bucket", "collection", collectionData);
        updateCollection.next();

        expect(updateCollection.throw("error").value)
          .eql(put(notifyError("error", {clear: true})));
      });
    });
  });

  describe("deleteCollection()", () => {
    describe("Success", () => {
      let bucket, deleteCollection;

      before(() => {
        bucket = {deleteCollection() {}};
        setClient({bucket() {return bucket;}});
        deleteCollection = saga.deleteCollection("bucket", "collection");
      });

      it("should delete the collection", () => {
        expect(deleteCollection.next().value)
          .eql(call([bucket, bucket.deleteCollection], "collection"));
      });

      it("should update the route path", () => {
        expect(deleteCollection.next().value)
          .eql(put(updatePath("")));
      });

      it("should dispatch a notification", () => {
        expect(deleteCollection.next().value)
          .eql(put(notifySuccess("Collection deleted.")));
      });

      it("should reload the list of buckets/collections", () => {
        expect(deleteCollection.next().value)
          .eql(call(listBuckets));
      });
    });

    describe("Failure", () => {
      let deleteCollection;

      before(() => {
        deleteCollection = saga.deleteCollection("bucket", "collection");
        deleteCollection.next();
      });

      it("should dispatch an error notification action", () => {
        expect(deleteCollection.throw("error").value)
          .eql(put(notifyError("error", {clear: true})));
      });
    });
  });

  describe("Watchers", () => {
    describe("watchBucketCreate()", () => {
      it("should watch for the createBucket action", () => {
        const watchBucketCreate = saga.watchBucketCreate();

        expect(watchBucketCreate.next().value)
          .eql(take(BUCKET_CREATE_REQUEST));

        expect(watchBucketCreate.next(actions.createBucket("a", "b")).value)
          .eql(fork(saga.createBucket, "a", "b"));
      });
    });

    describe("watchBucketUpdate()", () => {
      it("should watch for the updateBucket action", () => {
        const watchBucketUpdate = saga.watchBucketUpdate();

        expect(watchBucketUpdate.next().value)
          .eql(take(BUCKET_UPDATE_REQUEST));

        expect(watchBucketUpdate.next(actions.updateBucket("a", "b")).value)
          .eql(fork(saga.updateBucket, "a", "b"));
      });
    });

    describe("watchBucketDelete()", () => {
      it("should watch for the deleteBucket action", () => {
        const watchBucketDelete = saga.watchBucketDelete();

        expect(watchBucketDelete.next().value)
          .eql(take(BUCKET_DELETE_REQUEST));

        expect(watchBucketDelete.next(actions.deleteBucket("a")).value)
          .eql(fork(saga.deleteBucket, "a"));
      });
    });

    describe("watchCollectionLoad()", () => {
      it("should watch for the loadCollection action", () => {
        const watchCollectionLoad = saga.watchCollectionLoad();

        expect(watchCollectionLoad.next().value)
          .eql(take(COLLECTION_LOAD_REQUEST));

        expect(watchCollectionLoad.next(actions.loadCollection("a", "b")).value)
          .eql(fork(saga.loadCollection, "a", "b"));
      });
    });

    describe("watchCollectionCreate()", () => {
      it("should watch for the createCollection action", () => {
        const watchCollectionCreate = saga.watchCollectionCreate();

        expect(watchCollectionCreate.next().value)
          .eql(take(COLLECTION_CREATE_REQUEST));

        expect(watchCollectionCreate.next(
          actions.createCollection("a", "b")).value)
          .eql(fork(saga.createCollection, "a", "b"));
      });
    });

    describe("watchCollectionUpdate()", () => {
      it("should watch for the updateCollection action", () => {
        const watchCollectionUpdate = saga.watchCollectionUpdate();

        expect(watchCollectionUpdate.next().value)
          .eql(take(COLLECTION_UPDATE_REQUEST));

        expect(watchCollectionUpdate.next(
          actions.updateCollection("a", "b", "c")).value)
          .eql(fork(saga.updateCollection, "a", "b", "c"));
      });
    });

    describe("watchCollectionDelete()", () => {
      it("should watch for the deleteCollection action", () => {
        const watchCollectionDelete = saga.watchCollectionDelete();

        expect(watchCollectionDelete.next().value)
          .eql(take(COLLECTION_DELETE_REQUEST));

        expect(watchCollectionDelete.next(
          actions.deleteCollection("a", "b")).value)
          .eql(fork(saga.deleteCollection, "a", "b"));
      });
    });
  });
});
