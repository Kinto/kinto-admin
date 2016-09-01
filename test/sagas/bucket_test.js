import { expect } from "chai";
import { push as updatePath } from "react-router-redux";
import { put, call } from "redux-saga/effects";

import { notifyError, notifySuccess } from "../../scripts/actions/notifications";
import * as sessionActions from "../../scripts/actions/session";
import * as collectionActions from "../../scripts/actions/collection";
import * as groupActions from "../../scripts/actions/group";
import * as actions from "../../scripts/actions/bucket";
import * as saga from "../../scripts/sagas/bucket";
import { setClient } from "../../scripts/client";


const collectionData = {
  schema: {},
  uiSchema: {},
  attachment: {enabled: true, required: false},
  sort: "-title",
  displayFields: [],
};

const groupData = {
  id: "group",
  members: ["tartempion", "account:abc"]
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
          .eql(call([client, client.createBucket], "bucket", {data: {a: 1}, safe: true}));
      });

      it("should reload the list of buckets/collections", () => {
        expect(createBucket.next().value)
          .eql(put(sessionActions.listBuckets()));
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
          .eql(put(notifyError("Couldn't create bucket.", "error", {clear: true})));
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
          .eql(put(notifyError("Couldn't update bucket.", "error", {clear: true})));
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
          .eql(put(sessionActions.listBuckets()));
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
          .eql(put(notifyError("Couldn't delete bucket.", "error", {clear: true})));
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
            data: collectionData,
            safe: true,
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
          .eql(put(sessionActions.listBuckets()));
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
          .eql(put(notifyError("Couldn't create collection.", "error", {clear: true})));
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
          .eql(put(notifyError("Couldn't update collection.", "error", {clear: true})));
      });
    });
  });

  describe("deleteCollection()", () => {
    describe("Success", () => {
      let bucket, deleteCollection;

      before(() => {
        bucket = {deleteCollection() {}};
        setClient({bucket() {return bucket;}});
        const action = actions.deleteCollection("bucket", "collection");
        deleteCollection = saga.deleteCollection(() => {}, action);
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
          .eql(put(sessionActions.listBuckets()));
      });
    });

    describe("Failure", () => {
      let deleteCollection;

      before(() => {
        const action = actions.deleteCollection("bucket", "collection");
        deleteCollection = saga.deleteCollection(() => {}, action);
        deleteCollection.next();
      });

      it("should dispatch an error notification action", () => {
        expect(deleteCollection.throw("error").value)
          .eql(put(notifyError("Couldn't delete collection.", "error", {clear: true})));
      });
    });
  });


  describe("listBucketCollections()", () => {
    describe("Success", () => {
      let bucket, listBucketCollections;

      before(() => {
        bucket = {listCollections() {}};
        setClient({bucket() {return bucket;}});
        const action = actions.listBucketCollections("bucket");
        listBucketCollections = saga.listBucketCollections(() => {}, action);
      });

      it("should list the collections", () => {
        expect(listBucketCollections.next().value)
          .eql(call([bucket, bucket.listCollections]));
      });

      it("should dispatch the listBucketCollectionsSuccess action", () => {
        const results = [];
        expect(listBucketCollections.next({data: results}).value)
          .eql(put(actions.listBucketCollectionsSuccess(results)));
      });
    });

    describe("Failure", () => {
      let listBucketCollections;

      before(() => {
        const action = actions.listBucketCollections("bucket");
        listBucketCollections = saga.listBucketCollections(() => {}, action);
        listBucketCollections.next();
      });

      it("should dispatch an error notification action", () => {
        expect(listBucketCollections.throw("error").value)
          .eql(put(notifyError("Couldn't list bucket collections.", "error", {clear: true})));
      });
    });
  });


  describe("listBucketHistory()", () => {
    describe("Success", () => {
      let bucket, listBucketHistory;

      before(() => {
        bucket = {listHistory() {}};
        setClient({bucket() {return bucket;}});
        const action = actions.listBucketHistory("bucket");
        listBucketHistory = saga.listBucketHistory(() => {}, action);
      });

      it("should list the history", () => {
        expect(listBucketHistory.next().value)
          .eql(call([bucket, bucket.listHistory], {
            filters: {
              exclude_resource_name: "record"
            }
          }));
      });

      it("should dispatch the listBucketHistorySuccess action", () => {
        const results = [];
        expect(listBucketHistory.next({data: results}).value)
          .eql(put(actions.listBucketHistorySuccess(results)));
      });
    });

    describe("Failure", () => {
      let listBucketHistory;

      before(() => {
        const action = actions.listBucketHistory("bucket");
        listBucketHistory = saga.listBucketHistory(() => {}, action);
        listBucketHistory.next();
      });

      it("should dispatch an error notification action", () => {
        expect(listBucketHistory.throw("error").value)
          .eql(put(notifyError("Couldn't list bucket history.", "error", {clear: true})));
      });
    });
  });


  describe("createGroup()", () => {
    describe("Success", () => {
      let bucket, createGroup;

      before(() => {
        bucket = {createGroup() {}};
        setClient({bucket() {return bucket;}});
        const action = actions.createGroup("bucket", groupData);
        createGroup = saga.createGroup(() => {}, action);
      });

      it("should post the collection data", () => {
        expect(createGroup.next().value)
          .eql(call([bucket, bucket.createGroup], "group", groupData.members, {
            data: groupData
          }));
      });

      it("should update the route path", () => {
        expect(createGroup.next().value)
          .eql(put(updatePath("/buckets/bucket/groups/group/edit")));
      });

      it("should dispatch a notification", () => {
        expect(createGroup.next().value)
          .eql(put(notifySuccess("Group created.")));
      });
    });

    describe("Failure", () => {
      let createGroup;

      before(() => {
        const bucket = {createGroup() {}};
        setClient({bucket() {return bucket;}});
        const action = actions.createGroup("bucket", {
          ...collectionData,
          name: "collection",
        });
        createGroup = saga.createGroup(() => {}, action);
        createGroup.next();
      });

      it("should dispatch an error notification action", () => {
        expect(createGroup.throw("error").value)
          .eql(put(notifyError("Couldn't create group.", "error", {clear: true})));
      });
    });
  });

  describe("updateGroup()", () => {
    describe("Success", () => {
      let bucket, updateGroup;

      before(() => {
        bucket = {updateGroup() {}};
        setClient({bucket() {return bucket;}});
        const action = actions.updateGroup(
          "bucket", "group", groupData);
        updateGroup = saga.updateGroup(() => {}, action);
      });

      it("should post the group data", () => {
        expect(updateGroup.next().value)
          .eql(call([bucket, bucket.updateGroup], groupData));
      });

      it("should dispatch the groupLoadSuccess action", () => {
        expect(updateGroup.next({data: groupData}).value)
          .eql(put(groupActions.groupLoadSuccess(groupData)));
      });

      it("should update the route path", () => {
        expect(updateGroup.next().value)
          .eql(put(updatePath("/buckets/bucket/groups/group/edit")));
      });

      it("should dispatch a notification", () => {
        expect(updateGroup.next().value)
          .eql(put(notifySuccess("Group properties updated.")));
      });
    });

    describe("Failure", () => {
      it("should dispatch an error notification action", () => {
        const updateGroup = saga.updateGroup(
          "bucket", "group", groupData);
        updateGroup.next();

        expect(updateGroup.throw("error").value)
          .eql(put(notifyError("Couldn't update group.", "error", {clear: true})));
      });
    });
  });

  describe("deleteGroup()", () => {
    describe("Success", () => {
      let bucket, deleteGroup;

      before(() => {
        bucket = {deleteGroup() {}};
        setClient({bucket() {return bucket;}});
        const action = actions.deleteGroup("bucket", "group");
        deleteGroup = saga.deleteGroup(() => {}, action);
      });

      it("should delete the group", () => {
        expect(deleteGroup.next().value)
          .eql(call([bucket, bucket.deleteGroup], "group"));
      });

      it("should update the route path", () => {
        expect(deleteGroup.next().value)
          .eql(put(updatePath("/buckets/bucket/groups")));
      });

      it("should dispatch a notification", () => {
        expect(deleteGroup.next().value)
          .eql(put(notifySuccess("Group deleted.")));
      });
    });

    describe("Failure", () => {
      let deleteGroup;

      before(() => {
        const action = actions.deleteGroup("bucket", "group");
        deleteGroup = saga.deleteGroup(() => {}, action);
        deleteGroup.next();
      });

      it("should dispatch an error notification action", () => {
        expect(deleteGroup.throw("error").value)
          .eql(put(notifyError("Couldn't delete group.", "error", {clear: true})));
      });
    });
  });


  describe("listBucketGroups()", () => {
    describe("Success", () => {
      let bucket, listBucketGroups;

      before(() => {
        bucket = {listGroups() {}};
        setClient({bucket() {return bucket;}});
        const action = actions.listBucketGroups("bucket");
        listBucketGroups = saga.listBucketGroups(() => {}, action);
      });

      it("should list the groups", () => {
        expect(listBucketGroups.next().value)
          .eql(call([bucket, bucket.listGroups]));
      });

      it("should dispatch the listBucketGroupsSuccess action", () => {
        const results = [];
        expect(listBucketGroups.next({data: results}).value)
          .eql(put(actions.listBucketGroupsSuccess(results)));
      });
    });

    describe("Failure", () => {
      let listBucketGroups;

      before(() => {
        const action = actions.listBucketGroups("bucket");
        listBucketGroups = saga.listBucketGroups(() => {}, action);
        listBucketGroups.next();
      });

      it("should dispatch an error notification action", () => {
        expect(listBucketGroups.throw("error").value)
          .eql(put(notifyError("Couldn't list bucket groups.", "error", {clear: true})));
      });
    });
  });
});
