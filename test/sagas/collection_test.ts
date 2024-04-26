import * as actions from "@src/actions/collection";
import { notifySuccess } from "@src/actions/notifications";
import * as recordActions from "@src/actions/record";
import { redirectTo } from "@src/actions/route";
import { setClient } from "@src/client";
import * as saga from "@src/sagas/collection";
import { mockNotifyError } from "@test/testUtils";
import { call, put } from "redux-saga/effects";

const record = { id: 1, foo: "bar1" };
const record2 = { id: 2, foo: "bar2" };
const records = [record, record2];
const recordsWithAttachment = [
  { ...record, __attachment__: "fake-attachment" },
  record2,
];

describe("collection sagas", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("listRecords()", () => {
    describe("Success", () => {
      let collection;

      beforeAll(() => {
        collection = { listRecords() {} };
        const bucket = {
          collection() {
            return collection;
          },
        };
        setClient({
          bucket() {
            return bucket;
          },
        });
      });

      describe("Default sort", () => {
        let listRecords;

        beforeAll(() => {
          const action = actions.listRecords("bucket", "collection");
          const getState = () => ({
            collection: { data: { sort: "last_modified" } },
          });
          listRecords = saga.listRecords(getState, action);
        });

        it("should list collection records", () => {
          expect(listRecords.next().value).toStrictEqual(
            call([collection, collection.listRecords], {
              sort: "last_modified",
              limit: 200,
            })
          );
        });

        it("should dispatch the listRecordsSuccess action", () => {
          expect(listRecords.next({ data: records }).value).toStrictEqual(
            put(actions.listRecordsSuccess(records))
          );
        });
      });

      describe("Current sort", () => {
        let listRecords;

        beforeAll(() => {
          const action = actions.listRecords("bucket", "collection");
          const getState = () => ({
            collection: { currentSort: "title", data: { sort: "nope" } },
          });
          listRecords = saga.listRecords(getState, action);
        });

        it("should list collection records", () => {
          expect(listRecords.next().value).toStrictEqual(
            call([collection, collection.listRecords], {
              sort: "title",
              limit: 200,
            })
          );
        });

        it("should dispatch the listRecordsSuccess action", () => {
          expect(listRecords.next({ data: records }).value).toStrictEqual(
            put(actions.listRecordsSuccess(records))
          );
        });
      });

      describe("Custom sort", () => {
        let listRecords;

        beforeAll(() => {
          const action = actions.listRecords("bucket", "collection", "title");
          const getState = () => ({
            collection: { currentSort: "nope", data: { sort: "nope" } },
          });
          listRecords = saga.listRecords(getState, action);
        });

        it("should list collection records", () => {
          expect(listRecords.next().value).toStrictEqual(
            call([collection, collection.listRecords], {
              sort: "title",
              limit: 200,
            })
          );
        });

        it("should dispatch the listRecordsSuccess action", () => {
          expect(listRecords.next({ data: records }).value).toStrictEqual(
            put(actions.listRecordsSuccess(records))
          );
        });
      });
    });

    describe("Failure", () => {
      let listRecords, collection;

      beforeAll(() => {
        collection = { listRecords() {} };
        const bucket = {
          collection() {
            return collection;
          },
        };
        setClient({
          bucket() {
            return bucket;
          },
        });
        const getState = () => ({
          collection: { data: { sort: "nope" } },
        });
        const action = actions.listRecords("bucket", "collection");
        listRecords = saga.listRecords(getState, action);
        listRecords.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError();
        listRecords.throw("error");
        expect(mocked).toHaveBeenCalledWith("Couldn't list records.", "error");
      });
    });
  });

  describe("listNextRecords()", () => {
    describe("Success", () => {
      let listNextRecords, collection;

      beforeAll(() => {
        const action = actions.listNextRecords();
        collection = { listNextRecords() {} };
        const getState = () => ({ collection });
        listNextRecords = saga.listNextRecords(getState, action);
      });

      it("should list collection records", () => {
        expect(listNextRecords.next().value).toStrictEqual(
          call(collection.listNextRecords)
        );
      });

      it("should dispatch the listNextRecordsSuccess action", () => {
        const fakeNext = () => {};
        const result = { data: records, hasNextPage: false, next: fakeNext };
        expect(listNextRecords.next(result).value).toStrictEqual(
          put(actions.listRecordsSuccess(records, false, fakeNext, true))
        );
      });
    });

    describe("Failure", () => {
      let listNextRecords, collection;

      beforeAll(() => {
        const action = actions.listNextRecords();
        collection = { listNextRecords() {} };
        const getState = () => ({ collection });
        listNextRecords = saga.listNextRecords(getState, action);
        listNextRecords.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError();
        listNextRecords.throw("error");
        expect(mocked).toHaveBeenCalledWith(
          "Couldn't process next page.",
          "error"
        );
      });
    });
  });

  describe("createRecord()", () => {
    let collection;

    beforeAll(() => {
      collection = {
        createRecord() {},
        addAttachment() {},
      };
      const bucket = {
        collection() {
          return collection;
        },
      };
      setClient({
        bucket() {
          return bucket;
        },
      });
    });

    describe("Attachments disabled", () => {
      let createRecord;

      beforeAll(() => {
        const getState = () => ({
          session: {
            serverInfo: {
              capabilities: {},
            },
          },
        });
        const action = actions.createRecord("bucket", "collection", record);
        createRecord = saga.createRecord(getState, action);
      });

      it("should create the record", () => {
        expect(createRecord.next().value).toStrictEqual(
          call([collection, collection.createRecord], record, { safe: true })
        );
      });

      it("should update the route path", () => {
        expect(createRecord.next().value).toStrictEqual(
          put(
            redirectTo("collection:records", {
              bid: "bucket",
              cid: "collection",
            })
          )
        );
      });

      it("should dispatch a notification", () => {
        expect(createRecord.next().value).toStrictEqual(
          put(notifySuccess("Record created."))
        );
      });

      it("should unmark the current record as busy", () => {
        expect(createRecord.next().value).toStrictEqual(
          put(recordActions.recordBusy(false))
        );
      });
    });

    describe("Attachments enabled", () => {
      let createRecord;

      const attachment = "data:test/fake";

      beforeAll(() => {
        const getState = () => ({
          session: {
            serverInfo: {
              capabilities: { attachments: {} },
            },
          },
          collection: {},
        });
        const action = actions.createRecord(
          "bucket",
          "collection",
          record,
          attachment
        );
        createRecord = saga.createRecord(getState, action);
      });

      it("should post the attachment", () => {
        expect(createRecord.next().value).toStrictEqual(
          call([collection, collection.addAttachment], attachment, record, {
            safe: true,
          })
        );
      });

      it("should update the route path", () => {
        expect(createRecord.next().value).toStrictEqual(
          put(
            redirectTo("collection:records", {
              bid: "bucket",
              cid: "collection",
            })
          )
        );
      });

      it("should dispatch a notification", () => {
        expect(createRecord.next().value).toStrictEqual(
          put(notifySuccess("Record created."))
        );
      });

      it("should unmark the current record as busy", () => {
        expect(createRecord.next().value).toStrictEqual(
          put(recordActions.recordBusy(false))
        );
      });
    });

    describe("Failure", () => {
      let createRecord;

      beforeAll(() => {
        const getState = () => ({
          session: { serverInfo: { capabilities: {} } },
        });
        const action = actions.createRecord("bucket", "collection", record);
        createRecord = saga.createRecord(getState, action);
        createRecord.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError();
        createRecord.throw("error");
        expect(mocked).toHaveBeenCalledWith("Couldn't create record.", "error");
      });

      it("should unmark the current record as busy", () => {
        expect(createRecord.next().value).toStrictEqual(
          put(recordActions.recordBusy(false))
        );
      });
    });
  });

  describe("updateRecord()", () => {
    describe("Attachment disabled", () => {
      // Expose no attachment capability in server info state
      const getState = () => {
        return {
          session: {
            serverInfo: {
              capabilities: {},
            },
          },
          record: {
            data: {
              ...record,
              last_modified: 42,
            },
          },
        };
      };

      describe("Success, attributes", () => {
        let collection, updateRecord;

        const action = actions.updateRecord("bucket", "collection", 1, {
          data: {
            ...record,
            last_modified: 42,
          },
        });

        beforeAll(() => {
          collection = { updateRecord() {} };
          const bucket = {
            collection() {
              return collection;
            },
          };
          setClient({
            bucket() {
              return bucket;
            },
          });
          updateRecord = saga.updateRecord(getState, action);
        });

        it("should update the record", () => {
          expect(updateRecord.next().value).toStrictEqual(
            call(
              [collection, collection.updateRecord],
              {
                ...record,
                last_modified: 42,
              },
              {
                safe: true,
              }
            )
          );
        });

        it("should dispatch the resetRecord action", () => {
          expect(updateRecord.next({ data: record }).value).toStrictEqual(
            put(recordActions.resetRecord())
          );
        });

        it("should update the route path", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(
              redirectTo("collection:records", {
                bid: "bucket",
                cid: "collection",
              })
            )
          );
        });

        it("should dispatch a notification", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(notifySuccess("Record attributes updated."))
          );
        });

        it("should unmark the current record as busy", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(recordActions.recordBusy(false))
          );
        });
      });

      describe("Success, permissions", () => {
        let collection, updateRecord;

        const permissions = { a: 1 };

        const action = actions.updateRecord("bucket", "collection", 1, {
          permissions,
        });

        beforeAll(() => {
          collection = { updateRecord() {} };
          const bucket = {
            collection() {
              return collection;
            },
          };
          setClient({
            bucket() {
              return bucket;
            },
          });
          updateRecord = saga.updateRecord(getState, action);
        });

        it("should update the record", () => {
          expect(updateRecord.next().value).toStrictEqual(
            call(
              [collection, collection.updateRecord],
              {
                ...record,
                last_modified: 42,
              },
              {
                permissions,
                last_modified: 42,
                safe: true,
              }
            )
          );
        });

        it("should update the route path", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(
              redirectTo("record:permissions", {
                bid: "bucket",
                cid: "collection",
                rid: 1,
              })
            )
          );
        });

        it("should dispatch a notification", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(notifySuccess("Record permissions updated."))
          );
        });

        it("should unmark the current record as busy", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(recordActions.recordBusy(false))
          );
        });
      });

      describe("Failure", () => {
        let updateRecord;

        const action = actions.updateRecord("bucket", "collection", 1, {
          data: {
            ...record,
            last_modified: 42,
          },
        });

        beforeAll(() => {
          updateRecord = saga.updateRecord(getState, action);
          updateRecord.next();
        });

        it("should dispatch an error notification action", () => {
          const mocked = mockNotifyError();
          updateRecord.throw("error");
          expect(mocked).toHaveBeenCalledWith(
            "Couldn't update record.",
            "error"
          );
        });

        it("should unmark the current record as busy", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(recordActions.recordBusy(false))
          );
        });
      });
    });

    describe("Attachment enabled", () => {
      // Expose the attachment capability in server info state
      const getState = () => {
        return {
          collection: { data: {} },
          session: {
            serverInfo: {
              capabilities: {
                attachments: {},
              },
            },
          },
          record: {
            data: { last_modified: 42 },
          },
        };
      };

      const attachment = "data:test/fake";

      const action = actions.updateRecord(
        "bucket",
        "collection",
        1,
        {
          data: {
            ...record,
            last_modified: 42,
          },
        },
        attachment
      );

      describe("Success", () => {
        let collection, updateRecord;

        beforeAll(() => {
          collection = {
            updateRecord() {},
            addAttachment() {},
          };
          const bucket = {
            collection() {
              return collection;
            },
          };
          setClient({
            bucket() {
              return bucket;
            },
          });
          updateRecord = saga.updateRecord(getState, action);
        });

        it("should update the record with its attachment", () => {
          expect(updateRecord.next().value).toStrictEqual(
            call(
              [collection, collection.addAttachment],
              attachment,
              {
                ...record,
                last_modified: 42,
              },
              { safe: true }
            )
          );
        });

        it("should dispatch the resetRecord action", () => {
          expect(updateRecord.next({ data: record }).value).toStrictEqual(
            put(recordActions.resetRecord())
          );
        });

        it("should update the route path", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(
              redirectTo("collection:records", {
                bid: "bucket",
                cid: "collection",
              })
            )
          );
        });

        it("should dispatch a notification", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(notifySuccess("Record attributes updated."))
          );
        });

        it("should unmark the current record as busy", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(recordActions.recordBusy(false))
          );
        });
      });

      describe("Failure", () => {
        let updateRecord;

        beforeAll(() => {
          updateRecord = saga.updateRecord(getState, action);
          updateRecord.next();
        });

        it("should dispatch an error notification action", () => {
          const mocked = mockNotifyError();
          updateRecord.throw("error");
          expect(mocked).toHaveBeenCalledWith(
            "Couldn't update record.",
            "error"
          );
        });

        it("should unmark the current record as busy", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(recordActions.recordBusy(false))
          );
        });
      });
    });
  });

  describe("deleteRecord()", () => {
    describe("Success", () => {
      let collection, deleteRecord;

      beforeAll(() => {
        collection = { deleteRecord() {} };
        const bucket = {
          collection() {
            return collection;
          },
        };
        setClient({
          bucket() {
            return bucket;
          },
        });
        const action = actions.deleteRecord("bucket", "collection", 1);
        deleteRecord = saga.deleteRecord(
          () => ({
            record: {
              data: { last_modified: 42 },
            },
          }),
          action
        );
      });

      it("should delete the record", () => {
        expect(deleteRecord.next().value).toStrictEqual(
          call([collection, collection.deleteRecord], 1, {
            safe: true,
            last_modified: 42,
          })
        );
      });

      it("should accept it from the action too", () => {
        const action = actions.deleteRecord("bucket", "collection", 1, 43);
        const deleteSaga = saga.deleteRecord(() => ({}), action);
        expect(deleteSaga.next().value).toStrictEqual(
          call([collection, collection.deleteRecord], 1, {
            safe: true,
            last_modified: 43,
          })
        );
      });

      it("should update the route path", () => {
        expect(deleteRecord.next().value).toStrictEqual(
          put(
            redirectTo("collection:records", {
              bid: "bucket",
              cid: "collection",
            })
          )
        );
      });

      it("should dispatch a notification", () => {
        expect(deleteRecord.next().value).toStrictEqual(
          put(notifySuccess("Record deleted."))
        );
      });

      it("should unmark the current record as busy", () => {
        expect(deleteRecord.next().value).toStrictEqual(
          put(recordActions.recordBusy(false))
        );
      });
    });

    describe("Failure", () => {
      let deleteRecord;

      beforeAll(() => {
        const action = actions.deleteRecord("bucket", "collection", 1);
        deleteRecord = saga.deleteRecord(
          () => ({
            record: { data: {} },
          }),
          action
        );
        deleteRecord.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError();
        deleteRecord.throw("error");
        expect(mocked).toHaveBeenCalledWith("Couldn't delete record.", "error");
      });

      it("should unmark the current record as busy", () => {
        expect(deleteRecord.next().value).toStrictEqual(
          put(recordActions.recordBusy(false))
        );
      });
    });
  });

  describe("deleteAttachment()", () => {
    let collection, deleteAttachment;

    beforeAll(() => {
      collection = { removeAttachment() {} };
      const bucket = {
        collection() {
          return collection;
        },
      };
      setClient({
        bucket() {
          return bucket;
        },
      });
      const action = actions.deleteAttachment("bucket", "collection", "record");
      deleteAttachment = saga.deleteAttachment(() => {}, action);
    });

    it("should mark the current collection as busy", () => {
      expect(deleteAttachment.next().value).toStrictEqual(
        put(actions.collectionBusy(true))
      );
    });

    it("should send a request for deleting the record attachment", () => {
      expect(deleteAttachment.next().value).toStrictEqual(
        call([collection, collection.removeAttachment], "record")
      );
    });

    it("should update the route path", () => {
      expect(deleteAttachment.next().value).toStrictEqual(
        put(
          redirectTo("record:attributes", {
            bid: "bucket",
            cid: "collection",
            rid: "record",
          })
        )
      );
    });

    it("should dispatch a notification", () => {
      expect(deleteAttachment.next().value).toStrictEqual(
        put(notifySuccess("Attachment deleted."))
      );
    });
  });

  describe("bulkCreateRecords()", () => {
    let collection;

    beforeAll(() => {
      collection = {
        batch() {},
        addAttachment() {},
        createRecord() {},
      };
      const bucket = {
        collection() {
          return collection;
        },
      };
      setClient({
        bucket() {
          return bucket;
        },
      });
    });

    describe("Attachments disabled", () => {
      let bulkCreateRecords;

      beforeAll(() => {
        const getState = () => ({
          session: {
            serverInfo: {
              capabilities: {},
            },
          },
        });
        const action = actions.bulkCreateRecords(
          "bucket",
          "collection",
          records
        );
        bulkCreateRecords = saga.bulkCreateRecords(getState, action);
      });

      it("should mark the current collection as busy", () => {
        expect(bulkCreateRecords.next().value).toStrictEqual(
          put(actions.collectionBusy(true))
        );
      });

      it("should batch create records", () => {
        const v = bulkCreateRecords.next().value;

        // We can't simply test for the passed batch function, so we're testing
        // the provided argument type here.
        expect(typeof v.payload.args[0]).toBe("function");
        expect(v.payload.args[1]).toStrictEqual({ aggregate: true });
      });

      it("should update the route path", () => {
        expect(
          bulkCreateRecords.next({ published: records, errors: [] }).value
        ).toStrictEqual(
          put(
            redirectTo("collection:records", {
              bid: "bucket",
              cid: "collection",
            })
          )
        );
      });

      it("should dispatch a notification", () => {
        expect(bulkCreateRecords.next().value).toStrictEqual(
          put(notifySuccess("2 records created."))
        );
      });

      it("should unmark the current collection as busy", () => {
        expect(bulkCreateRecords.next().value).toStrictEqual(
          put(actions.collectionBusy(false))
        );
      });
    });

    describe("Attachments enabled", () => {
      let bulkCreateRecords;

      beforeAll(() => {
        const getState = () => ({
          session: {
            serverInfo: {
              capabilities: { attachments: {} },
            },
          },
        });
        const action = actions.bulkCreateRecords(
          "bucket",
          "collection",
          recordsWithAttachment
        );
        bulkCreateRecords = saga.bulkCreateRecords(getState, action);
      });

      it("should mark the current collection as busy", () => {
        expect(bulkCreateRecords.next().value).toStrictEqual(
          put(actions.collectionBusy(true))
        );
      });

      it("should send the first attachment", () => {
        expect(bulkCreateRecords.next().value).toStrictEqual(
          call(
            [collection, collection.addAttachment],
            recordsWithAttachment[0].__attachment__,
            record
          )
        );
      });

      it("should send the second record with no attachment", () => {
        expect(bulkCreateRecords.next().value).toStrictEqual(
          call([collection, collection.createRecord], record2)
        );
      });

      it("should update the route path", () => {
        expect(
          bulkCreateRecords.next({
            published: recordsWithAttachment,
            errors: [],
          }).value
        ).toStrictEqual(
          put(
            redirectTo("collection:records", {
              bid: "bucket",
              cid: "collection",
            })
          )
        );
      });

      it("should dispatch a notification", () => {
        expect(bulkCreateRecords.next().value).toStrictEqual(
          put(notifySuccess("2 records created."))
        );
      });

      it("should unmark the current collection as busy", () => {
        expect(bulkCreateRecords.next().value).toStrictEqual(
          put(actions.collectionBusy(false))
        );
      });
    });

    describe("Failure", () => {
      let bulkCreateRecords;

      beforeAll(() => {
        const getState = () => ({
          session: {
            serverInfo: {
              capabilities: {},
            },
          },
        });
        const action = actions.bulkCreateRecords(
          "bucket",
          "collection",
          records
        );
        bulkCreateRecords = saga.bulkCreateRecords(getState, action);
        bulkCreateRecords.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError();
        bulkCreateRecords.throw("error");
        expect(mocked).toHaveBeenCalledWith(
          "Couldn't create some records.",
          "error",
          { details: [] }
        );
      });

      it("should unmark the current collection as busy", () => {
        expect(bulkCreateRecords.next().value).toStrictEqual(
          put(actions.collectionBusy(false))
        );
      });
    });
  });

  describe("listHistory()", () => {
    describe("Success", () => {
      let client, listHistory;

      beforeAll(() => {
        client = { listHistory() {} };
        setClient({
          bucket() {
            return client;
          },
        });
        const action = actions.listCollectionHistory(
          "bucket",
          "collection",
          "record"
        );
        const getState = () => ({});
        listHistory = saga.listHistory(getState, action);
      });

      it("should fetch history on collection", () => {
        expect(listHistory.next().value).toStrictEqual(
          call([client, client.listHistory], {
            limit: 200,
            filters: {
              resource_name: undefined,
              collection_id: "collection",
              exclude_user_id: undefined,
              "gt_target.data.last_modified": undefined,
            },
          })
        );
      });

      it("should filter from timestamp if provided", () => {
        const action = actions.listCollectionHistory("bucket", "collection", {
          since: 42,
        });
        const historySaga = saga.listHistory(() => ({}), action);
        expect(historySaga.next().value).toStrictEqual(
          call([client, client.listHistory], {
            filters: {
              resource_name: undefined,
              collection_id: "collection",
              exclude_user_id: undefined,
              "gt_target.data.last_modified": 42,
            },
            limit: 200,
          })
        );
      });

      it("should filter user ids if provided", () => {
        const action = actions.listCollectionHistory("bucket", "collection", {
          since: 42,
          exclude_user_id: "plugin:kinto-signer",
        });
        const historySaga = saga.listHistory(() => ({}), action);
        expect(historySaga.next().value).toStrictEqual(
          call([client, client.listHistory], {
            filters: {
              resource_name: undefined,
              collection_id: "collection",
              exclude_user_id: "plugin:kinto-signer",
              "gt_target.data.last_modified": 42,
            },
            limit: 200,
          })
        );
      });

      it("should dispatch the listCollectionHistorySuccess action", () => {
        const history = [];
        const result = { data: history };
        expect(listHistory.next(result).value).toStrictEqual(
          put(actions.listCollectionHistorySuccess(history))
        );
      });
    });

    describe("Failure", () => {
      let listHistory;

      beforeAll(() => {
        const action = actions.listCollectionHistory(
          "bucket",
          "collection",
          "record"
        );
        const getState = () => ({});
        listHistory = saga.listHistory(getState, action);
        listHistory.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError();
        listHistory.throw("error");
        expect(mocked).toHaveBeenCalledWith(
          "Couldn't list collection history.",
          "error"
        );
      });
    });
  });

  describe("listNextHistory()", () => {
    let listNextHistory;

    const fakeNext = () => {};

    beforeAll(() => {
      const action = actions.listCollectionNextHistory();
      const getState = () => ({ collection: { history: { next: fakeNext } } });
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
        put(actions.listCollectionHistorySuccess([], true, fakeNext))
      );
    });
  });
});
