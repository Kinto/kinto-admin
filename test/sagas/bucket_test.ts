import * as actions from "@src/actions/bucket";
import * as sessionActions from "@src/actions/session";
import { setClient } from "@src/client";
import * as saga from "@src/sagas/bucket";
import { mockNotifyError, mockNotifySuccess } from "@test/testUtils";
import { call, put } from "redux-saga/effects";

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
  let notifyErrorMock, notifySuccessMock;
  beforeEach(() => {
    notifyErrorMock = mockNotifyError();
    notifySuccessMock = mockNotifySuccess();
  });
  afterEach(() => {
    vi.resetAllMocks();
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

      it("should unmark the current session as busy and send a notification", () => {
        expect(createBucket.next().value).toStrictEqual(
          put(sessionActions.sessionBusy(false))
        );
        expect(notifySuccessMock).toHaveBeenCalledWith("Bucket created.");
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
        createBucket.throw("error");
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Couldn't create bucket.",
          "error"
        );
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

        it("should unmark the current session as busy and send a notifiation", () => {
          expect(updateBucket.next().value).toStrictEqual(
            put(sessionActions.sessionBusy(false))
          );
          expect(notifySuccessMock).toBeCalledWith(
            "Bucket attributes updated."
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
          updateBucket.throw("error");
          expect(notifyErrorMock).toHaveBeenCalledWith(
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

        it("should update the route path and send a notification", () => {
          expect(updateBucket.next().value).toStrictEqual(
            put(redirectTo("bucket:permissions", { bid: "bucket" }))
          );
        });

        it("should unmark the current session as busy and send a notification", () => {
          expect(updateBucket.next().value).toStrictEqual(
            put(sessionActions.sessionBusy(false))
          );
          expect(notifySuccessMock).toHaveBeenCalledWith(
            "Bucket permissions updated."
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
          updateBucket.throw("error");
          expect(notifyErrorMock).toHaveBeenCalledWith(
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

      it("should unmark the current collection as busy and send a notification", () => {
        expect(deleteBucket.next().value).toStrictEqual(
          put(sessionActions.sessionBusy(false))
        );
        expect(notifySuccessMock).toHaveBeenCalledWith("Bucket deleted.");
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

      it("should dispatch an error notification action and unmark collection as busy", () => {
        deleteBucket.throw("error");
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Couldn't delete bucket.",
          "error"
        );
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

      it("should dispatch a notification and reload the list of buckets/collections", () => {
        expect(createCollection.next().value).toStrictEqual(
          put(sessionActions.listBuckets())
        );
        expect(notifySuccessMock).toHaveBeenCalledWith("Collection created.");
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
        createCollection.throw("error");
        expect(notifyErrorMock).toHaveBeenCalledWith(
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
          updateCollection.next();
          expect(notifySuccessMock).toHaveBeenCalledWith(
            "Collection attributes updated."
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

          updateCollection.throw("error");
          expect(notifyErrorMock).toHaveBeenCalledWith(
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
          updateCollection.next();
          expect(notifySuccessMock).toHaveBeenCalledWith(
            "Collection permissions updated."
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
          updateCollection.throw("error");
          expect(notifyErrorMock).toHaveBeenCalledWith(
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

      it("should dispatch a notification then reload the list of buckets/collections", () => {
        expect(deleteCollection.next().value).toStrictEqual(
          put(sessionActions.listBuckets())
        );
        expect(notifySuccessMock).toHaveBeenCalledWith("Collection deleted.");
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
        deleteCollection.throw("error");
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Couldn't delete collection.",
          "error"
        );
      });
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
        createGroup.next();
        expect(notifySuccessMock).toHaveBeenCalledWith("Group created.");
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
        createGroup.throw("error");
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Couldn't create group.",
          "error"
        );
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
          updateGroup.next();
          expect(notifySuccessMock).toHaveBeenCalledWith(
            "Group attributes updated."
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

          updateGroup.throw("error");
          expect(notifyErrorMock).toHaveBeenCalledWith(
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
          updateGroup.next();
          expect(notifySuccessMock).toHaveBeenCalledWith(
            "Group permissions updated."
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
          updateGroup.throw("error");
          expect(notifyErrorMock).toHaveBeenCalledWith(
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

      it("should update the route path and trigger a notification", () => {
        expect(deleteGroup.next().value).toStrictEqual(
          put(redirectTo("bucket:groups", { bid: "bucket" }))
        );
        deleteGroup.next();
        expect(notifySuccessMock).toHaveBeenCalledWith("Group deleted.");
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
        deleteGroup.throw("error");
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Couldn't delete group.",
          "error"
        );
      });
    });
  });
});
