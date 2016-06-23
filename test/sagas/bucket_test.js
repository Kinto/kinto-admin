import { expect } from "chai";
import { push as updatePath } from "react-router-redux";
import { take, fork, put, call } from "redux-saga/effects";

import {
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
  attachment: {enabled: true, required: false},
  sort: "-title",
  displayFields: [],
};

describe("bucket sagas", () => {
  describe("createBucket()", () => {
    describe("Success", () => {
      let client, createBucket;

      before(() => {
        client = setClient({createBucket() {}});
        const action = actions.createBucket("bucket", {a: 1});
        createBucket = saga.createBucket(() => {}, action);
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
        const action = actions.createBucket("bucket");
        createBucket = saga.createBucket(() => {}, action);
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

      const response = {
        data: {a: 1},
        permissions: {write: [], read: []},
      };

      before(() => {
        bucket = {setData(){}};
        setClient({bucket(){return bucket;}});
        const action = actions.updateBucket("bucket", {a: 1});
        updateBucket = saga.updateBucket(()  => {}, action);
      });

      it("should mark the current session as busy", () => {
        expect(updateBucket.next().value)
          .eql(put(sessionActions.sessionBusy(true)));
      });

      it("should post new bucket data", () => {
        expect(updateBucket.next().value)
          .eql(call([bucket, bucket.setData], {a: 1}));
      });

      it("should update current bucket state", () => {
        const {data, permissions} = response;
        expect(updateBucket.next(response).value)
          .eql(put(actions.bucketLoadSuccess(data, permissions)));
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
        const action = actions.updateBucket("bucket", {});
        updateBucket = saga.updateBucket(() => {}, action);
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
        const action = actions.deleteBucket("bucket");
        deleteBucket = saga.deleteBucket(() => {}, action);
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
        const action = actions.deleteBucket("bucket");
        deleteBucket = saga.deleteBucket(() => {}, action);
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

  describe("createCollection()", () => {
    describe("Success", () => {
      let bucket, createCollection;

      before(() => {
        bucket = {createCollection() {}};
        setClient({bucket() {return bucket;}});
        const action = actions.createCollection("bucket", {
          ...collectionData,
          name: "collection",
        });
        createCollection = saga.createCollection(() => {}, action);
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
        const action = actions.createCollection("bucket", {
          ...collectionData,
          name: "collection",
        });
        createCollection = saga.createCollection(() => {}, action);
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
        const action = actions.updateCollection(
          "bucket", "collection", collectionData);
        updateCollection = saga.updateCollection(() => {}, action);
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

      it("should update the route path", () => {
        expect(updateCollection.next().value)
          .eql(put(updatePath("/buckets/bucket/collections/collection")));
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
