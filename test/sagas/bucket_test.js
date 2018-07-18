import sinon from "sinon";
import { expect } from "chai";
import { put, call } from "redux-saga/effects";

import { createSandbox, mockNotifyError } from "../test_utils";

import { notifySuccess } from "../../src/actions/notifications";
import * as sessionActions from "../../src/actions/session";
import { redirectTo } from "../../src/actions/route";
import * as actions from "../../src/actions/bucket";
import * as saga from "../../src/sagas/bucket";
import { setClient } from "../../src/client";
import { scrollToBottom } from "../../src/utils";

const collectionData = {
  schema: {},
  uiSchema: {},
  attachment: { enabled: true, required: false },
  sort: "-title",
  displayFields: [],
};

const groupData = {
  id: "group",
  members: ["tartempion", "account:abc"],
};

describe("bucket sagas", () => {
  const settings = {
    maxPerPage: 42,
  };

  let sandbox;

  beforeAll(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("createBucket()", () => {
    describe("Success", () => {
      let client, createBucket;

      beforeAll(() => {
        client = setClient({ createBucket() {} });
        const action = actions.createBucket("bucket", { a: 1 });
        createBucket = saga.createBucket(() => {}, action);
      });

      it("should mark the current session as busy", () => {
        expect(createBucket.next().value).eql(
          put(sessionActions.sessionBusy(true))
        );
      });

      it("should fetch collection attributes", () => {
        expect(createBucket.next().value).eql(
          call([client, client.createBucket], "bucket", {
            data: { a: 1 },
            safe: true,
          })
        );
      });

      it("should reload the list of buckets/collections", () => {
        expect(createBucket.next().value).eql(
          put(sessionActions.listBuckets())
        );
      });

      it("should update the route path", () => {
        expect(createBucket.next().value).eql(
          put(redirectTo("bucket:attributes", { bid: "bucket" }))
        );
      });

      it("should dispatch a notification", () => {
        expect(createBucket.next().value).eql(
          put(notifySuccess("Bucket created."))
        );
      });

      it("should unmark the current session as busy", () => {
        expect(createBucket.next().value).eql(
          put(sessionActions.sessionBusy(false))
        );
      });
    });

    describe("Failure", () => {
      let createBucket;

      beforeAll(() => {
        const action = actions.createBucket("bucket");
        createBucket = saga.createBucket(() => {}, action);
        createBucket.next();
        createBucket.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError(sandbox);
        createBucket.throw("error");
        sinon.assert.calledWith(mocked, "Couldn't create bucket.", "error");
      });

      it("should unmark the current session as busy", () => {
        expect(createBucket.next().value).eql(
          put(sessionActions.sessionBusy(false))
        );
      });
    });
  });

  describe("updateBucket()", () => {
    describe("Attributes", () => {
      describe("Success", () => {
        let bucket, updateBucket;

        beforeAll(() => {
          bucket = { setData() {} };
          setClient({
            bucket() {
              return bucket;
            },
          });
          const action = actions.updateBucket("bucket", { data: { a: 1 } });
          updateBucket = saga.updateBucket(
            () => ({
              bucket: { data: { last_modified: 42 } },
            }),
            action
          );
        });

        it("should mark the current session as busy", () => {
          expect(updateBucket.next().value).eql(
            put(sessionActions.sessionBusy(true))
          );
        });

        it("should post new bucket data", () => {
          expect(updateBucket.next().value).eql(
            call(
              [bucket, bucket.setData],
              { a: 1, last_modified: 42 },
              {
                safe: true,
              }
            )
          );
        });

        it("should update the route path", () => {
          expect(updateBucket.next().value).eql(
            put(redirectTo("bucket:attributes", { bid: "bucket" }))
          );
        });

        it("should dispatch a notification", () => {
          expect(updateBucket.next().value).eql(
            put(notifySuccess("Bucket attributes updated."))
          );
        });

        it("should unmark the current session as busy", () => {
          expect(updateBucket.next().value).eql(
            put(sessionActions.sessionBusy(false))
          );
        });
      });

      describe("Failure", () => {
        let updateBucket;

        beforeAll(() => {
          const action = actions.updateBucket("bucket", { data: {} });
          updateBucket = saga.updateBucket(
            () => ({
              bucket: { data: { last_modified: 42 } },
            }),
            action
          );
          updateBucket.next();
          updateBucket.next();
        });

        it("should dispatch an error notification action", () => {
          const mocked = mockNotifyError(sandbox);
          updateBucket.throw("error");
          sinon.assert.calledWith(mocked, "Couldn't update bucket.", "error");
        });

        it("should unmark the current session as busy", () => {
          expect(updateBucket.next().value).eql(
            put(sessionActions.sessionBusy(false))
          );
        });
      });
    });

    describe("Permissions", () => {
      describe("Success", () => {
        let bucket, updateBucket;

        beforeAll(() => {
          bucket = { setPermissions() {} };
          setClient({
            bucket() {
              return bucket;
            },
          });
          const action = actions.updateBucket("bucket", {
            permissions: { a: 1 },
          });
          updateBucket = saga.updateBucket(
            () => ({
              bucket: { data: { last_modified: 42 } },
            }),
            action
          );
        });

        it("should mark the current session as busy", () => {
          expect(updateBucket.next().value).eql(
            put(sessionActions.sessionBusy(true))
          );
        });

        it("should post new bucket permissions", () => {
          expect(updateBucket.next().value).eql(
            call(
              [bucket, bucket.setPermissions],
              { a: 1 },
              {
                safe: true,
                last_modified: 42,
              }
            )
          );
        });

        it("should update the route path", () => {
          expect(updateBucket.next().value).eql(
            put(redirectTo("bucket:permissions", { bid: "bucket" }))
          );
        });

        it("should dispatch a notification", () => {
          expect(updateBucket.next().value).eql(
            put(notifySuccess("Bucket permissions updated."))
          );
        });

        it("should unmark the current session as busy", () => {
          expect(updateBucket.next().value).eql(
            put(sessionActions.sessionBusy(false))
          );
        });
      });

      describe("Failure", () => {
        let updateBucket;

        beforeAll(() => {
          const action = actions.updateBucket("bucket", { permissions: {} });
          updateBucket = saga.updateBucket(
            () => ({
              bucket: { data: { last_modified: 42 } },
            }),
            action
          );
          updateBucket.next();
          updateBucket.next();
        });

        it("should dispatch an error notification action", () => {
          const mocked = mockNotifyError(sandbox);
          updateBucket.throw("error");
          sinon.assert.calledWith(mocked, "Couldn't update bucket.", "error");
        });

        it("should unmark the current session as busy", () => {
          expect(updateBucket.next().value).eql(
            put(sessionActions.sessionBusy(false))
          );
        });
      });
    });
  });

  describe("deleteBucket()", () => {
    describe("Success", () => {
      let client, deleteBucket;

      beforeAll(() => {
        client = setClient({ deleteBucket() {} });
        const action = actions.deleteBucket("bucket");
        deleteBucket = saga.deleteBucket(
          () => ({
            bucket: { data: { last_modified: 42 } },
          }),
          action
        );
      });

      it("should mark the current session as busy", () => {
        expect(deleteBucket.next().value).eql(
          put(sessionActions.sessionBusy(true))
        );
      });

      it("should fetch perform a deleteBucket", () => {
        expect(deleteBucket.next().value).eql(
          call([client, client.deleteBucket], "bucket", {
            safe: true,
            last_modified: 42,
          })
        );
      });

      it("should reload the list of buckets/collections", () => {
        expect(deleteBucket.next().value).eql(
          put(sessionActions.listBuckets())
        );
      });

      it("should update the route path", () => {
        expect(deleteBucket.next().value).eql(put(redirectTo("home", {})));
      });

      it("should dispatch a notification", () => {
        expect(deleteBucket.next().value).eql(
          put(notifySuccess("Bucket deleted."))
        );
      });

      it("should unmark the current collection as busy", () => {
        expect(deleteBucket.next().value).eql(
          put(sessionActions.sessionBusy(false))
        );
      });
    });

    describe("Failure", () => {
      let deleteBucket;

      beforeAll(() => {
        const action = actions.deleteBucket("bucket");
        deleteBucket = saga.deleteBucket(
          () => ({
            bucket: { data: { last_modified: 42 } },
          }),
          action
        );
        deleteBucket.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError(sandbox);
        deleteBucket.throw("error");
        sinon.assert.calledWith(mocked, "Couldn't delete bucket.", "error");
      });

      it("should unmark the current collection as busy", () => {
        expect(deleteBucket.next().value).eql(
          put(sessionActions.sessionBusy(false))
        );
      });
    });
  });

  describe("createCollection()", () => {
    describe("Success", () => {
      let bucket, createCollection;

      beforeAll(() => {
        bucket = { createCollection() {} };
        setClient({
          bucket() {
            return bucket;
          },
        });
        const action = actions.createCollection("bucket", {
          ...collectionData,
          id: "collection",
        });
        createCollection = saga.createCollection(() => {}, action);
      });

      it("should post the collection data", () => {
        expect(createCollection.next().value).eql(
          call([bucket, bucket.createCollection], "collection", {
            data: collectionData,
            safe: true,
          })
        );
      });

      it("should update the route path", () => {
        expect(createCollection.next().value).eql(
          put(
            redirectTo("collection:records", {
              bid: "bucket",
              cid: "collection",
            })
          )
        );
      });

      it("should dispatch a notification", () => {
        expect(createCollection.next().value).eql(
          put(notifySuccess("Collection created."))
        );
      });

      it("should reload the list of buckets/collections", () => {
        expect(createCollection.next().value).eql(
          put(sessionActions.listBuckets())
        );
      });
    });

    describe("Failure", () => {
      let createCollection;

      beforeAll(() => {
        const bucket = { createCollection() {} };
        setClient({
          bucket() {
            return bucket;
          },
        });
        const action = actions.createCollection("bucket", {
          ...collectionData,
          name: "collection",
        });
        createCollection = saga.createCollection(() => {}, action);
        createCollection.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError(sandbox);
        createCollection.throw("error");
        sinon.assert.calledWith(mocked, "Couldn't create collection.", "error");
      });
    });
  });

  describe("updateCollection()", () => {
    describe("Attributes", () => {
      describe("Success", () => {
        let bucket, collection, updateCollection;

        beforeAll(() => {
          collection = { setData() {} };
          bucket = {
            collection() {
              return collection;
            },
          };
          setClient({
            bucket() {
              return bucket;
            },
          });
          const action = actions.updateCollection("bucket", "collection", {
            data: collectionData,
          });
          updateCollection = saga.updateCollection(
            () => ({
              collection: { data: { last_modified: 42 } },
            }),
            action
          );
        });

        it("should post the collection data", () => {
          expect(updateCollection.next().value).eql(
            call(
              [collection, collection.setData],
              {
                ...collectionData,
                last_modified: 42,
              },
              { safe: true }
            )
          );
        });

        it("should update the route path", () => {
          expect(updateCollection.next().value).eql(
            put(
              redirectTo("collection:records", {
                bid: "bucket",
                cid: "collection",
              })
            )
          );
        });

        it("should dispatch a notification", () => {
          expect(updateCollection.next().value).eql(
            put(notifySuccess("Collection attributes updated."))
          );
        });
      });

      describe("Failure", () => {
        it("should dispatch an error notification action", () => {
          const action = actions.updateCollection("bucket", "collection", {
            data: collectionData,
          });
          const updateCollection = saga.updateCollection(
            () => ({
              collection: { data: { last_modified: 42 } },
            }),
            action
          );
          updateCollection.next();

          const mocked = mockNotifyError(sandbox);
          updateCollection.throw("error");
          sinon.assert.calledWith(
            mocked,
            "Couldn't update collection.",
            "error"
          );
        });
      });
    });

    describe("Permissions", () => {
      describe("Success", () => {
        let bucket, collection, updateCollection;

        beforeAll(() => {
          collection = { setPermissions() {} };
          bucket = {
            collection() {
              return collection;
            },
          };
          setClient({
            bucket() {
              return bucket;
            },
          });
          const action = actions.updateCollection("bucket", "collection", {
            permissions: { a: 1 },
          });
          updateCollection = saga.updateCollection(
            () => ({
              collection: { data: { last_modified: 42 } },
            }),
            action
          );
        });

        it("should post new collection permissions", () => {
          expect(updateCollection.next().value).eql(
            call(
              [collection, collection.setPermissions],
              { a: 1 },
              {
                safe: true,
                last_modified: 42,
              }
            )
          );
        });

        it("should update the route path", () => {
          expect(updateCollection.next().value).eql(
            put(
              redirectTo("collection:permissions", {
                bid: "bucket",
                cid: "collection",
              })
            )
          );
        });

        it("should dispatch a notification", () => {
          expect(updateCollection.next().value).eql(
            put(notifySuccess("Collection permissions updated."))
          );
        });
      });

      describe("Failure", () => {
        let updateCollection;

        beforeAll(() => {
          const action = actions.updateCollection("bucket", "collection", {
            permissions: {},
          });
          updateCollection = saga.updateCollection(
            () => ({
              collection: { data: { last_modified: 42 } },
            }),
            action
          );
          updateCollection.next();
          updateCollection.next();
        });

        it("should dispatch an error notification action", () => {
          const mocked = mockNotifyError(sandbox);
          updateCollection.throw("error");
          sinon.assert.calledWith(
            mocked,
            "Couldn't update collection.",
            "error"
          );
        });
      });
    });
  });

  describe("deleteCollection()", () => {
    describe("Success", () => {
      let bucket, deleteCollection;

      beforeAll(() => {
        bucket = { deleteCollection() {} };
        setClient({
          bucket() {
            return bucket;
          },
        });
        const action = actions.deleteCollection("bucket", "collection");
        deleteCollection = saga.deleteCollection(
          () => ({
            collection: { data: { last_modified: 42 } },
          }),
          action
        );
      });

      it("should delete the collection", () => {
        expect(deleteCollection.next().value).eql(
          call([bucket, bucket.deleteCollection], "collection", {
            safe: true,
            last_modified: 42,
          })
        );
      });

      it("should update the route path", () => {
        expect(deleteCollection.next().value).eql(
          put(redirectTo("bucket:collections", { bid: "bucket" }))
        );
      });

      it("should dispatch a notification", () => {
        expect(deleteCollection.next().value).eql(
          put(notifySuccess("Collection deleted."))
        );
      });

      it("should reload the list of buckets/collections", () => {
        expect(deleteCollection.next().value).eql(
          put(sessionActions.listBuckets())
        );
      });
    });

    describe("Failure", () => {
      let deleteCollection;

      beforeAll(() => {
        const action = actions.deleteCollection("bucket", "collection");
        deleteCollection = saga.deleteCollection(
          () => ({
            collection: { data: { last_modified: 42 } },
          }),
          action
        );
        deleteCollection.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError(sandbox);
        deleteCollection.throw("error");
        sinon.assert.calledWith(mocked, "Couldn't delete collection.", "error");
      });
    });
  });

  describe("listBucketCollections()", () => {
    describe("Success", () => {
      let bucket, listBucketCollections;

      beforeAll(() => {
        bucket = { listCollections() {} };
        setClient({
          bucket() {
            return bucket;
          },
        });
        const action = actions.listBucketCollections("bucket");
        listBucketCollections = saga.listBucketCollections(
          () => ({ settings }),
          action
        );
      });

      it("should list the collections", () => {
        expect(listBucketCollections.next().value).eql(
          call([bucket, bucket.listCollections], {
            limit: 42,
          })
        );
      });

      it("should dispatch the listBucketCollectionsSuccess action", () => {
        const results = [];
        expect(listBucketCollections.next({ data: results }).value).eql(
          put(actions.listBucketCollectionsSuccess(results))
        );
      });
    });

    describe("Failure", () => {
      let listBucketCollections;

      beforeAll(() => {
        const action = actions.listBucketCollections("bucket");
        listBucketCollections = saga.listBucketCollections(
          () => ({ settings }),
          action
        );
        listBucketCollections.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError(sandbox);
        listBucketCollections.throw("error");
        sinon.assert.calledWith(
          mocked,
          "Couldn't list bucket collections.",
          "error"
        );
      });
    });
  });

  describe("listHistory()", () => {
    describe("Success", () => {
      let bucket, listHistory;

      beforeAll(() => {
        bucket = { listHistory() {} };
        setClient({
          bucket() {
            return bucket;
          },
        });
        const action = actions.listBucketHistory("bucket");
        const getState = () => ({ settings });
        listHistory = saga.listHistory(getState, action);
      });

      it("should list the history", () => {
        expect(listHistory.next().value).eql(
          call([bucket, bucket.listHistory], {
            filters: {
              resource_name: undefined,
              exclude_resource_name: "record",
            },
            limit: 42,
            since: undefined,
          })
        );
      });

      it("should dispatch the listBucketHistorySuccess action", () => {
        const results = [];
        expect(listHistory.next({ data: results }).value).eql(
          put(actions.listBucketHistorySuccess(results))
        );
      });

      it("should filter from timestamp if provided", () => {
        const action = actions.listBucketHistory("bucket", { since: 42 });
        const historySaga = saga.listHistory(() => ({ settings }), action);
        expect(historySaga.next().value).eql(
          call([bucket, bucket.listHistory], {
            filters: {
              resource_name: undefined,
              exclude_resource_name: "record",
            },
            limit: 42,
            since: 42,
          })
        );
      });

      it("should filter by resource_name if provided", () => {
        const action = actions.listBucketHistory("bucket", {
          since: 42,
          resource_name: "bucket",
        });
        const historySaga = saga.listHistory(() => ({ settings }), action);
        expect(historySaga.next().value).eql(
          call([bucket, bucket.listHistory], {
            filters: {
              resource_name: "bucket",
              exclude_resource_name: "record",
            },
            limit: 42,
            since: 42,
          })
        );
      });
    });

    describe("Failure", () => {
      let listHistory;

      beforeAll(() => {
        const action = actions.listBucketHistory("bucket");
        listHistory = saga.listHistory(() => ({ settings }), action);
        listHistory.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError(sandbox);
        listHistory.throw("error");
        sinon.assert.calledWith(
          mocked,
          "Couldn't list bucket history.",
          "error"
        );
      });
    });
  });

  describe("listNextHistory()", () => {
    let listNextHistory;

    const fakeNext = () => {};

    beforeAll(() => {
      const action = actions.listBucketNextHistory();
      const getState = () => ({ bucket: { history: { next: fakeNext } } });
      listNextHistory = saga.listNextHistory(getState, action);
    });

    it("should fetch the next history page", () => {
      expect(listNextHistory.next().value).eql(call(fakeNext));
    });

    it("should dispatch the listBucketHistorySuccess action", () => {
      expect(
        listNextHistory.next({
          data: [],
          hasNextPage: true,
          next: fakeNext,
        }).value
      ).eql(put(actions.listBucketHistorySuccess([], true, fakeNext)));
    });

    it("should scroll the window to the bottom", () => {
      expect(listNextHistory.next().value).eql(call(scrollToBottom));
    });
  });

  describe("createGroup()", () => {
    describe("Success", () => {
      let bucket, createGroup;

      beforeAll(() => {
        bucket = { createGroup() {} };
        setClient({
          bucket() {
            return bucket;
          },
        });
        const action = actions.createGroup("bucket", groupData);
        createGroup = saga.createGroup(() => {}, action);
      });

      it("should post the collection data", () => {
        expect(createGroup.next().value).eql(
          call([bucket, bucket.createGroup], "group", groupData.members, {
            data: groupData,
            safe: true,
          })
        );
      });

      it("should update the route path", () => {
        expect(createGroup.next().value).eql(
          put(
            redirectTo("group:attributes", {
              bid: "bucket",
              gid: "group",
            })
          )
        );
      });

      it("should dispatch a notification", () => {
        expect(createGroup.next().value).eql(
          put(notifySuccess("Group created."))
        );
      });
    });

    describe("Failure", () => {
      let createGroup;

      beforeAll(() => {
        const bucket = { createGroup() {} };
        setClient({
          bucket() {
            return bucket;
          },
        });
        const action = actions.createGroup("bucket", {
          ...collectionData,
          name: "collection",
        });
        createGroup = saga.createGroup(() => {}, action);
        createGroup.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError(sandbox);
        createGroup.throw("error");
        sinon.assert.calledWith(mocked, "Couldn't create group.", "error");
      });
    });
  });

  describe("updateGroup()", () => {
    describe("Attributes", () => {
      describe("Success", () => {
        let bucket, updateGroup;

        beforeAll(() => {
          bucket = { updateGroup() {} };
          setClient({
            bucket() {
              return bucket;
            },
          });
          const action = actions.updateGroup("bucket", "group", {
            data: groupData,
          });
          updateGroup = saga.updateGroup(
            () => ({
              group: { data: { last_modified: 42 } },
            }),
            action
          );
        });

        it("should post the group data", () => {
          expect(updateGroup.next().value).eql(
            call(
              [bucket, bucket.updateGroup],
              {
                ...groupData,
                last_modified: 42,
              },
              { safe: true }
            )
          );
        });

        it("should update the route path", () => {
          expect(updateGroup.next().value).eql(
            put(
              redirectTo("group:attributes", {
                bid: "bucket",
                gid: "group",
              })
            )
          );
        });

        it("should dispatch a notification", () => {
          expect(updateGroup.next().value).eql(
            put(notifySuccess("Group attributes updated."))
          );
        });
      });

      describe("Failure", () => {
        it("should dispatch an error notification action", () => {
          const action = actions.updateGroup("bucket", "group", {
            data: groupData,
          });
          const updateGroup = saga.updateGroup(
            () => ({
              group: { data: { last_modified: 42 } },
            }),
            action
          );
          updateGroup.next();

          const mocked = mockNotifyError(sandbox);
          updateGroup.throw("error");
          sinon.assert.calledWith(mocked, "Couldn't update group.", "error");
        });
      });
    });

    describe("Permissions", () => {
      describe("Success", () => {
        let bucket, updateGroup;
        const loadedGroup = { last_modified: 42 };

        beforeAll(() => {
          bucket = { updateGroup() {} };
          setClient({
            bucket() {
              return bucket;
            },
          });
          const action = actions.updateGroup("bucket", "group", {
            permissions: { a: 1 },
          });
          updateGroup = saga.updateGroup(
            () => ({
              group: { data: loadedGroup },
            }),
            action
          );
        });

        it("should post new group permissions", () => {
          expect(updateGroup.next().value).eql(
            call([bucket, bucket.updateGroup], loadedGroup, {
              permissions: { a: 1 },
              safe: true,
              last_modified: 42,
            })
          );
        });

        it("should update the route path", () => {
          expect(updateGroup.next().value).eql(
            put(
              redirectTo("group:permissions", {
                bid: "bucket",
                gid: "group",
              })
            )
          );
        });

        it("should dispatch a notification", () => {
          expect(updateGroup.next().value).eql(
            put(notifySuccess("Group permissions updated."))
          );
        });
      });

      describe("Failure", () => {
        let updateGroup;

        beforeAll(() => {
          const action = actions.updateGroup("bucket", "group", {
            permissions: {},
          });
          updateGroup = saga.updateGroup(
            () => ({
              group: { data: { last_modified: 42 } },
            }),
            action
          );
          updateGroup.next();
          updateGroup.next();
        });

        it("should dispatch an error notification action", () => {
          const mocked = mockNotifyError(sandbox);
          updateGroup.throw("error");
          sinon.assert.calledWith(mocked, "Couldn't update group.", "error");
        });
      });
    });
  });

  describe("deleteGroup()", () => {
    describe("Success", () => {
      let bucket, deleteGroup;

      beforeAll(() => {
        bucket = { deleteGroup() {} };
        setClient({
          bucket() {
            return bucket;
          },
        });
        const action = actions.deleteGroup("bucket", "group");
        deleteGroup = saga.deleteGroup(
          () => ({
            group: { data: { last_modified: 42 } },
          }),
          action
        );
      });

      it("should delete the group", () => {
        expect(deleteGroup.next().value).eql(
          call([bucket, bucket.deleteGroup], "group", {
            safe: true,
            last_modified: 42,
          })
        );
      });

      it("should update the route path", () => {
        expect(deleteGroup.next().value).eql(
          put(redirectTo("bucket:groups", { bid: "bucket" }))
        );
      });

      it("should dispatch a notification", () => {
        expect(deleteGroup.next().value).eql(
          put(notifySuccess("Group deleted."))
        );
      });
    });

    describe("Failure", () => {
      let deleteGroup;

      beforeAll(() => {
        const action = actions.deleteGroup("bucket", "group");
        deleteGroup = saga.deleteGroup(
          () => ({
            group: { data: { last_modified: 42 } },
          }),
          action
        );
        deleteGroup.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError(sandbox);
        deleteGroup.throw("error");
        sinon.assert.calledWith(mocked, "Couldn't delete group.", "error");
      });
    });
  });
});
