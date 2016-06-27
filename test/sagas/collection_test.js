import { expect } from "chai";
import { push as updatePath } from "react-router-redux";
import { take, fork, put, call } from "redux-saga/effects";
import { v4 as uuid } from "uuid";

import {
  SESSION_SERVERINFO_SUCCESS,
  RECORD_BULK_CREATE_REQUEST,
} from "../../scripts/constants";
import { notifyError, notifySuccess } from "../../scripts/actions/notifications";
import * as collectionActions from "../../scripts/actions/collection";
import * as recordActions from "../../scripts/actions/record";
import * as saga from "../../scripts/sagas/collection";
import { setClient, requestAttachment } from "../../scripts/client";
import { createFormData } from "../../scripts/utils";


const record = {id: 1, foo: "bar1"};
const records = [
  record,
  {id: 2, foo: "bar2"},
];
const recordsWithAttachment = records.map((record, i) => {
  return {...record, __attachment__: {n: i + 1}};
});

describe("collection sagas", () => {
  describe("listRecords()", () => {
    describe("Success", () => {
      let collection;

      before(() => {
        collection = {listRecords() {}};
        const bucket = {collection() {return collection;}};
        setClient({bucket() {return bucket;}});
      });

      describe("Default sort", () => {
        let listRecords;

        before(() => {
          const action = collectionActions.listRecords("bucket", "collection");
          const getState = () => ({collection: {sort: "title"}});
          listRecords = saga.listRecords(getState, action);
        });

        it("should list collection records", () => {
          expect(listRecords.next().value)
            .eql(call([collection, collection.listRecords], {sort: "title"}));
        });

        it("should dispatch the listRecordsSuccess action", () => {
          expect(listRecords.next({data: records}).value)
            .eql(put(collectionActions.listRecordsSuccess(records)));
        });
      });

      describe("Custom sort", () => {
        let listRecords;

        before(() => {
          const action = collectionActions.listRecords("bucket", "collection", "title");
          const getState = () => ({collection: {sort: "nope"}});
          listRecords = saga.listRecords(getState, action);
        });

        it("should list collection records", () => {
          expect(listRecords.next().value)
            .eql(call([collection, collection.listRecords], {sort: "title"}));
        });

        it("should dispatch the listRecordsSuccess action", () => {
          expect(listRecords.next({data: records}).value)
            .eql(put(collectionActions.listRecordsSuccess(records)));
        });
      });
    });

    describe("Failure", () => {
      let listRecords, collection;

      before(() => {
        collection = {listRecords() {}};
        const bucket = {collection() {return collection;}};
        setClient({bucket() {return bucket;}});
        const getState = () => ({collection: {}});
        const action = collectionActions.listRecords("bucket", "collection");
        listRecords = saga.listRecords(getState, action);
        listRecords.next();
      });

      it("should dispatch an error notification action", () => {
        expect(listRecords.throw("error").value)
          .eql(put(notifyError("error")));
      });
    });
  });

  describe("createRecord()", () => {
    let collection;

    before(() => {
      collection = {createRecord() {}};
      const bucket = {collection() {return collection;}};
      setClient({bucket() {return bucket;}});
    });

    describe("Attachments disabled", () => {
      let createRecord;

      before(() => {
        const getState = () => ({
          session: {
            serverInfo: {
              capabilities: {}
            }
          }
        });
        const action = collectionActions.createRecord("bucket", "collection", record);
        createRecord = saga.createRecord(getState, action);
      });

      it("should mark the current collection as busy", () => {
        expect(createRecord.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should create the record", () => {
        expect(createRecord.next().value)
          .eql(call([collection, collection.createRecord], record));
      });

      it("should update the route path", () => {
        expect(createRecord.next().value)
          .eql(put(updatePath("/buckets/bucket/collections/collection")));
      });

      it("should dispatch a notification", () => {
        expect(createRecord.next().value)
          .eql(put(notifySuccess("Record added.")));
      });

      it("should unmark the current collection as busy", () => {
        expect(createRecord.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });

    describe("Attachments enabled", () => {
      let createRecord;

      const recordWithAttachment = {...record, __attachment__: {}};

      before(() => {
        const getState = () => ({
          session: {
            serverInfo: {
              capabilities: {attachments: {}}
            }
          }
        });
        const action = collectionActions.createRecord(
          "bucket", "collection", recordWithAttachment);
        createRecord = saga.createRecord(getState, action);
      });

      it("should mark the current collection as busy", () => {
        expect(createRecord.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should generate a uuid for the record", () => {
        expect(createRecord.next().value)
          .eql(call(uuid));
      });

      it("should create formData", () => {
        expect(createRecord.next("fake-uuid").value)
          .eql(call(createFormData, recordWithAttachment));
      });

      it("should post the attachment along the record", () => {
        const formData = {fake: true};
        expect(createRecord.next(formData).value)
          .eql(call(requestAttachment, "bucket", "collection", "fake-uuid", {
            method: "post",
            body: formData
          }));
      });

      it("should update the route path", () => {
        expect(createRecord.next().value)
          .eql(put(updatePath("/buckets/bucket/collections/collection")));
      });

      it("should dispatch a notification", () => {
        expect(createRecord.next().value)
          .eql(put(notifySuccess("Record added.")));
      });

      it("should unmark the current collection as busy", () => {
        expect(createRecord.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });

    describe("Failure", () => {
      let createRecord;

      before(() => {
        const getState = () => ({session: {serverInfo: {capabilities: {}}}});
        const action = collectionActions.createRecord("bucket", "collection", record);
        createRecord = saga.createRecord(getState, action);
        createRecord.next();
      });

      it("should dispatch an error notification action", () => {
        expect(createRecord.throw("error").value)
          .eql(put(notifyError("error")));
      });

      it("should unmark the current collection as busy", () => {
        expect(createRecord.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
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
              capabilities: {}
            }
          }
        };
      };

      const action = collectionActions.updateRecord("bucket", "collection", 1, record);

      describe("Success", () => {
        let collection, updateRecord;

        before(() => {
          collection = {updateRecord() {}};
          const bucket = {collection() {return collection;}};
          setClient({bucket() {return bucket;}});
          updateRecord = saga.updateRecord(getState, action);
        });

        it("should mark the current collection as busy", () => {
          expect(updateRecord.next().value)
            .eql(put(collectionActions.collectionBusy(true)));
        });

        it("should update the record", () => {
          expect(updateRecord.next().value)
            .eql(call([collection, collection.updateRecord], record, {patch: true}));
        });

        it("should dispatch the resetRecord action", () => {
          expect(updateRecord.next({data: record}).value)
            .eql(put(recordActions.resetRecord()));
        });

        it("should update the route path", () => {
          expect(updateRecord.next().value)
            .eql(put(updatePath("/buckets/bucket/collections/collection")));
        });

        it("should dispatch a notification", () => {
          expect(updateRecord.next().value)
            .eql(put(notifySuccess("Record updated.")));
        });

        it("should unmark the current collection as busy", () => {
          expect(updateRecord.next().value)
            .eql(put(collectionActions.collectionBusy(false)));
        });
      });

      describe("Failure", () => {
        let updateRecord;

        before(() => {
          updateRecord = saga.updateRecord(getState, action);
          updateRecord.next();
        });

        it("should dispatch an error notification action", () => {
          expect(updateRecord.throw("error").value)
            .eql(put(notifyError("error")));
        });

        it("should unmark the current collection as busy", () => {
          expect(updateRecord.next().value)
            .eql(put(collectionActions.collectionBusy(false)));
        });
      });
    });

    describe("Attachment enabled", () => {
      // Expose the attachment capability in server info state
      const getState = () => {
        return {
          session: {
            serverInfo: {
              capabilities: {
                attachments: {}
              }
            }
          }
        };
      };

      const recordWithAttachment = {...record, __attachment__: {}};

      const action = collectionActions.updateRecord(
        "bucket", "collection", 1, recordWithAttachment);

      describe("Success", () => {
        let collection, updateRecord;

        before(() => {
          collection = {updateRecord() {}};
          const bucket = {collection() {return collection;}};
          setClient({bucket() {return bucket;}});
          updateRecord = saga.updateRecord(getState, action);
        });

        it("should mark the current collection as busy", () => {
          expect(updateRecord.next().value)
            .eql(put(collectionActions.collectionBusy(true)));
        });

        it("should create formData from the record object", () => {
          expect(updateRecord.next().value)
            .eql(call(createFormData, recordWithAttachment));
        });

        it("should update the record with its attachment", () => {
          const fakeFormData = {fake: true};
          expect(updateRecord.next(fakeFormData).value)
            .eql(call(requestAttachment, "bucket", "collection", 1, {
              method: "post",
              body: fakeFormData,
            }));
        });

        it("should dispatch the resetRecord action", () => {
          expect(updateRecord.next({data: record}).value)
            .eql(put(recordActions.resetRecord()));
        });

        it("should update the route path", () => {
          expect(updateRecord.next().value)
            .eql(put(updatePath("/buckets/bucket/collections/collection")));
        });

        it("should dispatch a notification", () => {
          expect(updateRecord.next().value)
            .eql(put(notifySuccess("Record updated.")));
        });

        it("should unmark the current collection as busy", () => {
          expect(updateRecord.next().value)
            .eql(put(collectionActions.collectionBusy(false)));
        });
      });

      describe("Failure", () => {
        let updateRecord;

        before(() => {
          updateRecord = saga.updateRecord(getState, action);
          updateRecord.next();
        });

        it("should dispatch an error notification action", () => {
          expect(updateRecord.throw("error").value)
            .eql(put(notifyError("error")));
        });

        it("should unmark the current collection as busy", () => {
          expect(updateRecord.next().value)
            .eql(put(collectionActions.collectionBusy(false)));
        });
      });
    });
  });

  describe("deleteRecord()", () => {
    describe("Success", () => {
      let collection, deleteRecord;

      before(() => {
        collection = {deleteRecord() {}};
        const bucket = {collection() {return collection;}};
        setClient({bucket() {return bucket;}});
        const action = collectionActions.deleteRecord("bucket", "collection", 1);
        deleteRecord = saga.deleteRecord(() => {}, action);
      });

      it("should mark the current collection as busy", () => {
        expect(deleteRecord.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should create the record", () => {
        expect(deleteRecord.next().value)
          .eql(call([collection, collection.deleteRecord], 1));
      });

      it("should update the route path", () => {
        expect(deleteRecord.next().value)
          .eql(put(updatePath("/buckets/bucket/collections/collection")));
      });

      it("should dispatch a notification", () => {
        expect(deleteRecord.next().value)
          .eql(put(notifySuccess("Record deleted.")));
      });

      it("should unmark the current collection as busy", () => {
        expect(deleteRecord.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });

    describe("Failure", () => {
      let deleteRecord;

      before(() => {
        deleteRecord = saga.deleteRecord("bucket", "collection", 1);
        deleteRecord.next();
      });

      it("should dispatch an error notification action", () => {
        expect(deleteRecord.throw("error").value)
          .eql(put(notifyError("error")));
      });

      it("should unmark the current collection as busy", () => {
        expect(deleteRecord.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });
  });

  describe("deleteAttachment()", () => {
    let deleteAttachment;

    before(() => {
      const action = collectionActions.deleteAttachment("bucket", "collection", "record");
      deleteAttachment = saga.deleteAttachment(() => {}, action);
    });

    it("should mark the current collection as busy", () => {
      expect(deleteAttachment.next().value)
        .eql(put(collectionActions.collectionBusy(true)));
    });

    it("should send a request for deleting the record attachment", () => {
      expect(deleteAttachment.next().value)
        .eql(call(requestAttachment, "bucket", "collection", "record", {
          method: "delete"
        }));
    });

    it("should update the route path", () => {
      expect(deleteAttachment.next().value)
        .eql(put(updatePath("/buckets/bucket/collections/collection/edit/record")));
    });

    it("should dispatch a notification", () => {
      expect(deleteAttachment.next().value)
        .eql(put(notifySuccess("Attachment deleted.")));
    });
  });

  describe("bulkCreateRecords()", () => {
    describe("Success", () => {
      let collection, bulkCreateRecords;

      before(() => {
        collection = {batch() {}};
        const bucket = {collection() {return collection;}};
        setClient({bucket() {return bucket;}});
        bulkCreateRecords = saga.bulkCreateRecords("bucket", "collection", records);
      });

      it("should mark the current collection as busy", () => {
        expect(bulkCreateRecords.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should batch create records", () => {
        const v = bulkCreateRecords.next().value;

        // We can't simply test for the passed batch function, so we're testing
        // the provided argument type here.
        expect(v.CALL.args[0]).to.be.a("function");
        expect(v.CALL.args[1]).eql({aggregate: true});
      });

      it("should update the route path", () => {
        expect(bulkCreateRecords.next({published: records, errors: []}).value)
          .eql(put(updatePath("/buckets/bucket/collections/collection")));
      });

      it("should dispatch a notification", () => {
        expect(bulkCreateRecords.next().value)
          .eql(put(notifySuccess("2 records created.")));
      });

      it("should unmark the current collection as busy", () => {
        expect(bulkCreateRecords.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });

    describe("Failure", () => {
      let bulkCreateRecords;

      before(() => {
        bulkCreateRecords = saga.bulkCreateRecords("bucket", "collection", records);
        bulkCreateRecords.next();
      });

      it("should dispatch an error notification action", () => {
        expect(bulkCreateRecords.throw("error").value)
          .eql(put(notifyError("error")));
      });

      it("should unmark the current collection as busy", () => {
        expect(bulkCreateRecords.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });
  });

  describe("bulkCreateRecordsWithAttachment()", () => {
    describe("Success", () => {
      let bulkCreateRecordsWithAttachment;

      before(() => {
        bulkCreateRecordsWithAttachment = saga.bulkCreateRecordsWithAttachment(
          "bucket", "collection", recordsWithAttachment);
      });

      it("should mark the current collection as busy", () => {
        expect(bulkCreateRecordsWithAttachment.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should create the uuid for the first record", () => {
        expect(bulkCreateRecordsWithAttachment.next().value)
          .eql(call(uuid));
      });

      it("should create formData for the first record", () => {
        expect(bulkCreateRecordsWithAttachment.next("fake-uuid1").value)
          .eql(call(createFormData, recordsWithAttachment[0]));
      });

      it("should post the first record with its attachment", () => {
        const formData = {fake: true};
        expect(bulkCreateRecordsWithAttachment.next(formData).value)
          .eql(call(requestAttachment, "bucket", "collection", "fake-uuid1", {
            method: "post",
            body: formData
          }));
      });

      it("should create the uuid for the second record", () => {
        expect(bulkCreateRecordsWithAttachment.next().value)
          .eql(call(uuid));
      });

      it("should create formData for the second record", () => {
        expect(bulkCreateRecordsWithAttachment.next("fake-uuid2").value)
          .eql(call(createFormData, recordsWithAttachment[1]));
      });

      it("should post the second record with its attachment", () => {
        const formData = {fake: true};
        expect(bulkCreateRecordsWithAttachment.next(formData).value)
          .eql(call(requestAttachment, "bucket", "collection", "fake-uuid2", {
            method: "post",
            body: formData
          }));
      });

      it("should update the route path", () => {
        expect(bulkCreateRecordsWithAttachment.next({
          published: recordsWithAttachment,
          errors: [],
        }).value)
          .eql(put(updatePath("/buckets/bucket/collections/collection")));
      });

      it("should dispatch a notification", () => {
        expect(bulkCreateRecordsWithAttachment.next().value)
          .eql(put(notifySuccess("2 records created.")));
      });

      it("should unmark the current collection as busy", () => {
        expect(bulkCreateRecordsWithAttachment.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });

    describe("Failure", () => {
      let bulkCreateRecordsWithAttachment;

      before(() => {
        bulkCreateRecordsWithAttachment = saga.bulkCreateRecordsWithAttachment(
          "bucket", "collection", records);
        bulkCreateRecordsWithAttachment.next();
      });

      it("should dispatch an error notification action", () => {
        expect(bulkCreateRecordsWithAttachment.throw("error").value)
          .eql(put(notifyError("error")));
      });

      it("should unmark the current collection as busy", () => {
        expect(bulkCreateRecordsWithAttachment.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });
  });

  describe("Watchers", () => {
    describe("watchBulkCreateRecords()", () => {
      describe("Attachments enabled", () => {
        it("should watch for the bulkCreateRecords action", () => {
          const watchBulkCreateRecords = saga.watchBulkCreateRecords();

          expect(watchBulkCreateRecords.next().value)
            .eql(take(SESSION_SERVERINFO_SUCCESS));

          const serverInfoAction = {
            serverInfo: {capabilities: {attachments: {}}}
          };

          expect(watchBulkCreateRecords.next(serverInfoAction).value)
            .eql(take(RECORD_BULK_CREATE_REQUEST));

          const records = [{__attachment__: {}}];
          expect(watchBulkCreateRecords.next(
            collectionActions.bulkCreateRecords("a", "b", records)).value)
            .eql(fork(saga.bulkCreateRecordsWithAttachment, "a", "b", records));
        });
      });

      describe("Attachments disabled", () => {
        it("should watch for the bulkCreateRecords action", () => {
          const watchBulkCreateRecords = saga.watchBulkCreateRecords();

          expect(watchBulkCreateRecords.next().value)
            .eql(take(SESSION_SERVERINFO_SUCCESS));

          const serverInfoAction = {
            serverInfo: {capabilities: {}}
          };

          expect(watchBulkCreateRecords.next(serverInfoAction).value)
            .eql(take(RECORD_BULK_CREATE_REQUEST));

          expect(watchBulkCreateRecords.next(
            collectionActions.bulkCreateRecords("a", "b", "c")).value)
            .eql(fork(saga.bulkCreateRecords, "a", "b", "c"));
        });
      });
    });
  });
});
