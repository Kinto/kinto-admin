import { put, call } from "redux-saga/effects";

import { mockNotifyError } from "../test_utils";

import { notifySuccess } from "../../src/actions/notifications";
import * as sessionActions from "../../src/actions/session";
import { redirectTo } from "../../src/actions/route";
import * as actions from "../../src/actions/bucket";
import * as saga from "../../src/sagas/bucket";
import { setClient } from "../../src/client";

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
  afterEach(() => {
    jest.resetAllMocks();
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
        expect(createBucket.next().value).toStrictEqual(
          put(sessionActions.sessionBusy(true))
        );
      });

      it("should fetch collection attributes", () => {
        expect(createBucket.next().value).toStrictEqual(
          call([client, client.createBucket], "bucket", {
            data: { a: 1 },
            safe: true,
          })
        );
      });

      it("should reload the list of buckets/collections", () => {
        expect(createBucket.next().value).toStrictEqual(
          put(sessionActions.listBuckets())
        );
      });

      it("should update the route path", () => {
        expect(createBucket.next().value).toStrictEqual(
          put(redirectTo("bucket:attributes", { bid: "bucket" }))
        );
      });

      it("should dispatch a notification", () => {
        expect(createBucket.next().value).toStrictEqual(
          put(notifySuccess("Bucket created."))
        );
      });

      it("should unmark the current session as busy", () => {
        expect(createBucket.next().value).toStrictEqual(
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
        const mocked = mockNotifyError();
        createBucket.throw("error");
        expect(mocked).toHaveBeenCalledWith("Couldn't create bucket.", "error");
      });

      it("should unmark the current session as busy", () => {
        expect(createBucket.next().value).toStrictEqual(
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
          expect(updateBucket.next().value).toStrictEqual(
            put(sessionActions.sessionBusy(true))
          );
        });

        it("should post new bucket data", () => {
          expect(updateBucket.next().value).toStrictEqual(
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
          expect(updateBucket.next().value).toStrictEqual(
            put(redirectTo("bucket:attributes", { bid: "bucket" }))
          );
        });

        it("should dispatch a notification", () => {
          expect(updateBucket.next().value).toStrictEqual(
            put(notifySuccess("Bucket attributes updated."))
          );
        });

        it("should unmark the current session as busy", () => {
          expect(updateBucket.next().value).toStrictEqual(
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
          const mocked = mockNotifyError();
          updateBucket.throw("error");
          expect(mocked).toHaveBeenCalledWith(
            "Couldn't update bucket.",
            "error"
          );
        });

        it("should unmark the current session as busy", () => {
          expect(updateBucket.next().value).toStrictEqual(
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
          expect(updateBucket.next().value).toStrictEqual(
            put(sessionActions.sessionBusy(true))
          );
        });

        it("should post new bucket permissions", () => {
          expect(updateBucket.next().value).toStrictEqual(
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
          expect(updateBucket.next().value).toStrictEqual(
            put(redirectTo("bucket:permissions", { bid: "bucket" }))
          );
        });

        it("should dispatch a notification", () => {
          expect(updateBucket.next().value).toStrictEqual(
            put(notifySuccess("Bucket permissions updated."))
          );
        });

        it("should unmark the current session as busy", () => {
          expect(updateBucket.next().value).toStrictEqual(
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
          const mocked = mockNotifyError();
          updateBucket.throw("error");
          expect(mocked).toHaveBeenCalledWith(
            "Couldn't update bucket.",
            "error"
          );
        });

        it("should unmark the current session as busy", () => {
          expect(updateBucket.next().value).toStrictEqual(
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
        expect(deleteBucket.next().value).toStrictEqual(
          put(sessionActions.sessionBusy(true))
        );
      });

      it("should fetch perform a deleteBucket", () => {
        expect(deleteBucket.next().value).toStrictEqual(
          call([client, client.deleteBucket], "bucket", {
            safe: true,
            last_modified: 42,
          })
        );
      });

      it("should reload the list of buckets/collections", () => {
        expect(deleteBucket.next().value).toStrictEqual(
          put(sessionActions.listBuckets())
        );
      });

      it("should update the route path", () => {
        expect(deleteBucket.next().value).toStrictEqual(
          put(redirectTo("home", {}))
        );
      });

      it("should dispatch a notification", () => {
        expect(deleteBucket.next().value).toStrictEqual(
          put(notifySuccess("Bucket deleted."))
        );
      });

      it("should unmark the current collection as busy", () => {
        expect(deleteBucket.next().value).toStrictEqual(
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
        const mocked = mockNotifyError();
        deleteBucket.throw("error");
        expect(mocked).toHaveBeenCalledWith("Couldn't delete bucket.", "error");
      });

      it("should unmark the current collection as busy", () => {
        expect(deleteBucket.next().value).toStrictEqual(
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
        expect(createCollection.next().value).toStrictEqual(
          call([bucket, bucket.createCollection], "collection", {
            data: collectionData,
            safe: true,
          })
        );
      });

      it("should update the route path", () => {
        expect(createCollection.next().value).toStrictEqual(
          put(
            redirectTo("collection:records", {
              bid: "bucket",
              cid: "collection",
            })
          )
        );
      });

      it("should dispatch a notification", () => {
        expect(createCollection.next().value).toStrictEqual(
          put(notifySuccess("Collection created."))
        );
      });

      it("should reload the list of buckets/collections", () => {
        expect(createCollection.next().value).toStrictEqual(
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
        const mocked = mockNotifyError();
        createCollection.throw("error");
        expect(mocked).toHaveBeenCalledWith(
          "Couldn't create collection.",
          "error"
        );
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
          expect(updateCollection.next().value).toStrictEqual(
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
          expect(updateCollection.next().value).toStrictEqual(
            put(
              redirectTo("collection:attributes", {
                bid: "bucket",
                cid: "collection",
              })
            )
          );
        });

        it("should dispatch a notification", () => {
          expect(updateCollection.next().value).toStrictEqual(
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

          const mocked = mockNotifyError();
          updateCollection.throw("error");
          expect(mocked).toHaveBeenCalledWith(
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
          expect(updateCollection.next().value).toStrictEqual(
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
          expect(updateCollection.next().value).toStrictEqual(
            put(
              redirectTo("collection:permissions", {
                bid: "bucket",
                cid: "collection",
              })
            )
          );
        });

        it("should dispatch a notification", () => {
          expect(updateCollection.next().value).toStrictEqual(
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
          const mocked = mockNotifyError();
          updateCollection.throw("error");
          expect(mocked).toHaveBeenCalledWith(
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
        expect(deleteCollection.next().value).toStrictEqual(
          call([bucket, bucket.deleteCollection], "collection", {
            safe: true,
            last_modified: 42,
          })
        );
      });

      it("should update the route path", () => {
        expect(deleteCollection.next().value).toStrictEqual(
          put(redirectTo("bucket:collections", { bid: "bucket" }))
        );
      });

      it("should dispatch a notification", () => {
        expect(deleteCollection.next().value).toStrictEqual(
          put(notifySuccess("Collection deleted."))
        );
      });

      it("should reload the list of buckets/collections", () => {
        expect(deleteCollection.next().value).toStrictEqual(
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
        const mocked = mockNotifyError();
        deleteCollection.throw("error");
        expect(mocked).toHaveBeenCalledWith(
          "Couldn't delete collection.",
          "error"
        );
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
        listBucketCollections = saga.listBucketCollections(() => ({}), action);
      });

      it("should list the collections", () => {
        expect(listBucketCollections.next().value).toStrictEqual(
          call([bucket, bucket.listCollections], {
            limit: 200,
          })
        );
      });

      it("should dispatch the listBucketCollectionsSuccess action", () => {
        const results = [];
        expect(
          listBucketCollections.next({ data: results }).value
        ).toStrictEqual(put(actions.listBucketCollectionsSuccess(results)));
      });
    });

    describe("Failure", () => {
      let listBucketCollections;

      beforeAll(() => {
        const action = actions.listBucketCollections("bucket");
        listBucketCollections = saga.listBucketCollections(() => ({}), action);
        listBucketCollections.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError();
        listBucketCollections.throw("error");
        expect(mocked).toHaveBeenCalledWith(
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
        const getState = () => ({});
        listHistory = saga.listHistory(getState, action);
      });

      it("should list the history", () => {
        expect(listHistory.next().value).toStrictEqual(
          call([bucket, bucket.listHistory], {
            filters: {
              resource_name: undefined,
              exclude_resource_name: "record",
            },
            limit: 200,
          })
        );
      });

      it("should dispatch the listBucketHistorySuccess action", () => {
        const results = [];
        expect(listHistory.next({ data: results }).value).toStrictEqual(
          put(actions.listBucketHistorySuccess(results))
        );
      });

      it("should filter by resource_name if provided", () => {
        const action = actions.listBucketHistory("bucket", {
          resource_name: "bucket",
        });
        const historySaga = saga.listHistory(() => ({}), action);
        expect(historySaga.next().value).toStrictEqual(
          call([bucket, bucket.listHistory], {
            filters: {
              resource_name: "bucket",
              exclude_resource_name: "record",
            },
            limit: 200,
          })
        );
      });
    });

    describe("Failure", () => {
      let listHistory;

      beforeAll(() => {
        const action = actions.listBucketHistory("bucket");
        listHistory = saga.listHistory(() => ({}), action);
        listHistory.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError();
        listHistory.throw("error");
        expect(mocked).toHaveBeenCalledWith(
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
      expect(listNextHistory.next().value).toStrictEqual(call(fakeNext));
    });

    it("should dispatch the listBucketHistorySuccess action", () => {
      expect(
        listNextHistory.next({
          data: [],
          hasNextPage: true,
          next: fakeNext,
        }).value
      ).toStrictEqual(
        put(actions.listBucketHistorySuccess([], true, fakeNext))
      );
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
        expect(createGroup.next().value).toStrictEqual(
          call([bucket, bucket.createGroup], "group", groupData.members, {
            data: groupData,
            safe: true,
          })
        );
      });

      it("should update the route path", () => {
        expect(createGroup.next().value).toStrictEqual(
          put(
            redirectTo("bucket:groups", {
              bid: "bucket",
            })
          )
        );
      });

      it("should dispatch a notification", () => {
        expect(createGroup.next().value).toStrictEqual(
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
        const mocked = mockNotifyError();
        createGroup.throw("error");
        expect(mocked).toHaveBeenCalledWith("Couldn't create group.", "error");
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
          expect(updateGroup.next().value).toStrictEqual(
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
          expect(updateGroup.next().value).toStrictEqual(
            put(
              redirectTo("bucket:groups", {
                bid: "bucket",
              })
            )
          );
        });

        it("should dispatch a notification", () => {
          expect(updateGroup.next().value).toStrictEqual(
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

          const mocked = mockNotifyError();
          updateGroup.throw("error");
          expect(mocked).toHaveBeenCalledWith(
            "Couldn't update group.",
            "error"
          );
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
          expect(updateGroup.next().value).toStrictEqual(
            call([bucket, bucket.updateGroup], loadedGroup, {
              permissions: { a: 1 },
              safe: true,
              last_modified: 42,
            })
          );
        });

        it("should update the route path", () => {
          expect(updateGroup.next().value).toStrictEqual(
            put(
              redirectTo("group:permissions", {
                bid: "bucket",
                gid: "group",
              })
            )
          );
        });

        it("should dispatch a notification", () => {
          expect(updateGroup.next().value).toStrictEqual(
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
          const mocked = mockNotifyError();
          updateGroup.throw("error");
          expect(mocked).toHaveBeenCalledWith(
            "Couldn't update group.",
            "error"
          );
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
        expect(deleteGroup.next().value).toStrictEqual(
          call([bucket, bucket.deleteGroup], "group", {
            safe: true,
            last_modified: 42,
          })
        );
      });

      it("should update the route path", () => {
        expect(deleteGroup.next().value).toStrictEqual(
          put(redirectTo("bucket:groups", { bid: "bucket" }))
        );
      });

      it("should dispatch a notification", () => {
        expect(deleteGroup.next().value).toStrictEqual(
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
        const mocked = mockNotifyError();
        deleteGroup.throw("error");
        expect(mocked).toHaveBeenCalledWith("Couldn't delete group.", "error");
      });
    });
  });
});
