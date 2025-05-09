import * as actions from "@src/actions/collection";
import * as recordActions from "@src/actions/record";
import { setClient } from "@src/client";
import * as saga from "@src/sagas/collection";
import { mockNotifyError, mockNotifySuccess } from "@test/testUtils";
import { call, put } from "redux-saga/effects";

const record = { id: 1, foo: "bar1" };
const record2 = { id: 2, foo: "bar2" };
const records = [record, record2];
const recordsWithAttachment = [
  { ...record, __attachment__: "fake-attachment" },
  record2,
];

describe("collection sagas", () => {
  let notifySuccessMock, notifyErrorMock;
  beforeEach(() => {
    notifySuccessMock = mockNotifySuccess();
    notifyErrorMock = mockNotifyError();
  });
  afterEach(() => {
    vi.resetAllMocks();
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

      it("should unmark the current record as busy and send a notification", () => {
        expect(createRecord.next().value).toStrictEqual(
          put(recordActions.recordBusy(false))
        );
        expect(notifySuccessMock).toHaveBeenCalledWith("Record created.");
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

      it("should unmark the current record as busy and send a notification", () => {
        expect(createRecord.next().value).toStrictEqual(
          put(recordActions.recordBusy(false))
        );
        expect(notifySuccessMock).toHaveBeenCalledWith("Record created.");
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

      it("should unmark the current record as busy and send a notification", () => {
        createRecord.throw("error");
        expect(createRecord.next().value).toStrictEqual(
          put(recordActions.recordBusy(false))
        );
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Couldn't create record.",
          "error"
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

        it("should unmark the current record as busy and send a notification", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(recordActions.recordBusy(false))
          );
          expect(notifySuccessMock).toHaveBeenCalledWith(
            "Record attributes updated."
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

        it("should unmark the current record as busy and send a notification", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(recordActions.recordBusy(false))
          );
          expect(notifySuccessMock).toHaveBeenCalledWith(
            "Record permissions updated."
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
          updateRecord.throw("error");
          expect(notifyErrorMock).toHaveBeenCalledWith(
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

        it("should unmark the current record as busy and send a notification", () => {
          expect(updateRecord.next().value).toStrictEqual(
            put(recordActions.recordBusy(false))
          );
          expect(notifySuccessMock).toHaveBeenCalledWith(
            "Record attributes updated."
          );
        });
      });

      describe("Failure", () => {
        let updateRecord;

        beforeAll(() => {
          updateRecord = saga.updateRecord(getState, action);
          updateRecord.next();
        });

        it("should send a notification and unmark the current record as busy", () => {
          updateRecord.throw("error");
          expect(updateRecord.next().value).toStrictEqual(
            put(recordActions.recordBusy(false))
          );
          expect(notifyErrorMock).toHaveBeenCalledWith(
            "Couldn't update record.",
            "error"
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

      it("should unmark the current record as busy and send a notification", () => {
        expect(deleteRecord.next().value).toStrictEqual(
          put(recordActions.recordBusy(false))
        );
        expect(notifySuccessMock).toHaveBeenCalledWith("Record deleted.");
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

      it("should dispatch an error notification action and unmark the current record as busy", () => {
        deleteRecord.throw("error");
        expect(deleteRecord.next().value).toStrictEqual(
          put(recordActions.recordBusy(false))
        );
        expect(notifyErrorMock).toHaveBeenCalledWith(
          "Couldn't delete record.",
          "error"
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

    it("should update the route path and send a notification", () => {
      expect(deleteAttachment.next().value).toStrictEqual(
        put(
          redirectTo("record:attributes", {
            bid: "bucket",
            cid: "collection",
            rid: "record",
          })
        )
      );
      deleteAttachment.next();
      expect(notifySuccessMock).toHaveBeenCalledWith("Attachment deleted.");
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

      it("should unmark the current collection as busy and send a notification", () => {
        expect(bulkCreateRecords.next().value).toStrictEqual(
          put(actions.collectionBusy(false))
        );
        expect(notifySuccessMock).toHaveBeenCalledWith("2 records created.");
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

      it("should unmark the current collection as busy and send a notification", () => {
        expect(bulkCreateRecords.next().value).toStrictEqual(
          put(actions.collectionBusy(false))
        );
        expect(notifySuccessMock).toHaveBeenCalledWith("2 records created.");
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
        bulkCreateRecords.throw("error");
        expect(notifyErrorMock).toHaveBeenCalledWith(
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
});
