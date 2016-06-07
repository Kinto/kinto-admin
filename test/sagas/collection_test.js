import { expect } from "chai";
import { push as updatePath } from "react-router-redux";
import { take, fork, put, call } from "redux-saga/effects";
import { v4 as uuid } from "uuid";

import {
  SESSION_SERVERINFO_SUCCESS,
  COLLECTION_RECORDS_REQUEST,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_BULK_CREATE_REQUEST,
  ROUTE_LOAD_SUCCESS,
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
      let collection, listRecords;

      before(() => {
        collection = {listRecords() {}};
        const bucket = {collection() {return collection;}};
        setClient({bucket() {return bucket;}});
        listRecords = saga.listRecords("bucket", "collection");
      });

      it("should wait for the ROUTE_LOAD_SUCCESS action", () => {
        expect(listRecords.next().value)
          .eql(take(ROUTE_LOAD_SUCCESS));
      });

      it("should mark the current collection as busy", () => {
        expect(listRecords.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should list collection records", () => {
        expect(listRecords.next().value)
          .eql(call([collection, collection.listRecords]));
      });

      it("should dispatch the listRecordsSuccess action", () => {
        expect(listRecords.next({data: records}).value)
          .eql(put(collectionActions.listRecordsSuccess(records)));
      });

      it("should unmark the current collection as busy", () => {
        expect(listRecords.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });

    describe("Failure", () => {
      let listRecords;

      before(() => {
        listRecords = saga.listRecords("bucket", "collection");
        listRecords.next();
        listRecords.next(); // take(ROUTE_LOAD_SUCCESS)
      });

      it("should dispatch an error notification action", () => {
        expect(listRecords.throw("error").value)
          .eql(put(notifyError("error")));
      });

      it("should unmark the current collection as busy", () => {
        expect(listRecords.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });
  });

  describe("createRecord()", () => {
    describe("Success", () => {
      let collection, createRecord;

      before(() => {
        collection = {createRecord() {}};
        const bucket = {collection() {return collection;}};
        setClient({bucket() {return bucket;}});
        createRecord = saga.createRecord("bucket", "collection", record);
      });

      it("should mark the current collection as busy", () => {
        expect(createRecord.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should create the record", () => {
        expect(createRecord.next().value)
          .eql(call([collection, collection.createRecord], record));
      });

      it("should dispatch the listRecords action", () => {
        expect(createRecord.next({data: record}).value)
          .eql(put(collectionActions.listRecords("bucket", "collection")));
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
        createRecord = saga.createRecord("bucket", "collection", record);
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
    describe("Success", () => {
      let collection, updateRecord;

      before(() => {
        collection = {updateRecord() {}};
        const bucket = {collection() {return collection;}};
        setClient({bucket() {return bucket;}});
        updateRecord = saga.updateRecord("bucket", "collection", 1, record);
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

      it("should dispatch the listRecords action", () => {
        expect(updateRecord.next({data: record}).value)
          .eql(put(collectionActions.listRecords("bucket", "collection")));
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
        updateRecord = saga.updateRecord("bucket", "collection", 1, record);
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

  describe("deleteRecord()", () => {
    describe("Success", () => {
      let collection, deleteRecord;

      before(() => {
        collection = {deleteRecord() {}};
        const bucket = {collection() {return collection;}};
        setClient({bucket() {return bucket;}});
        deleteRecord = saga.deleteRecord("bucket", "collection", 1);
      });

      it("should mark the current collection as busy", () => {
        expect(deleteRecord.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should create the record", () => {
        expect(deleteRecord.next().value)
          .eql(call([collection, collection.deleteRecord], 1));
      });

      it("should dispatch the listRecords action", () => {
        expect(deleteRecord.next({data: record}).value)
          .eql(put(collectionActions.listRecords("bucket", "collection")));
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

  describe("createRecordWithAttachment()", () => {
    describe("Success", () => {
      let createRecordWithAttachment;

      before(() => {
        createRecordWithAttachment = saga.createRecordWithAttachment(
          "bucket", "collection", record);
      });

      it("should mark the current collection as busy", () => {
        expect(createRecordWithAttachment.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should generate a uuid for the record", () => {
        expect(createRecordWithAttachment.next().value)
          .eql(call(uuid));
      });

      it("should create formData", () => {
        expect(createRecordWithAttachment.next("fake-uuid").value)
          .eql(call(createFormData, record));
      });

      it("should post the attachment along the record", () => {
        const formData = {fake: true};
        expect(createRecordWithAttachment.next(formData).value)
          .eql(call(requestAttachment, "bucket", "collection", "fake-uuid", {
            method: "post",
            body: formData
          }));
      });

      it("should dispatch the listRecords action", () => {
        expect(createRecordWithAttachment.next().value)
          .eql(put(collectionActions.listRecords("bucket", "collection")));
      });

      it("should update the route path", () => {
        expect(createRecordWithAttachment.next().value)
          .eql(put(updatePath("/buckets/bucket/collections/collection")));
      });

      it("should dispatch a notification", () => {
        expect(createRecordWithAttachment.next().value)
          .eql(put(notifySuccess("Record added.")));
      });

      it("should unmark the current collection as busy", () => {
        expect(createRecordWithAttachment.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });

    describe("Failure", () => {
      let createRecordWithAttachment;

      before(() => {
        createRecordWithAttachment = saga.createRecordWithAttachment(
          "bucket", "collection", record);
        createRecordWithAttachment.next();
      });

      it("should dispatch an error notification action", () => {
        expect(createRecordWithAttachment.throw("error").value)
          .eql(put(notifyError("error")));
      });

      it("should unmark the current collection as busy", () => {
        expect(createRecordWithAttachment.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });
  });

  describe("updateRecordWithAttachment()", () => {
    describe("Success", () => {
      let updateRecordWithAttachment;

      before(() => {
        updateRecordWithAttachment = saga.updateRecordWithAttachment(
          "bucket", "collection", 1, record);
      });

      it("should mark the current collection as busy", () => {
        expect(updateRecordWithAttachment.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should create formData", () => {
        expect(updateRecordWithAttachment.next().value)
          .eql(call(createFormData, record));
      });

      it("should update the record", () => {
        const formData = {fake: true};
        expect(updateRecordWithAttachment.next(formData).value)
          .eql(call(requestAttachment, "bucket", "collection", 1, {
            method: "post",
            body: formData
          }));
      });

      it("should dispatch the resetRecord action", () => {
        expect(updateRecordWithAttachment.next({data: record}).value)
          .eql(put(recordActions.resetRecord()));
      });

      it("should dispatch the listRecords action", () => {
        expect(updateRecordWithAttachment.next({data: record}).value)
          .eql(put(collectionActions.listRecords("bucket", "collection")));
      });

      it("should update the route path", () => {
        expect(updateRecordWithAttachment.next().value)
          .eql(put(updatePath("/buckets/bucket/collections/collection")));
      });

      it("should dispatch a notification", () => {
        expect(updateRecordWithAttachment.next().value)
          .eql(put(notifySuccess("Record updated.")));
      });

      it("should unmark the current collection as busy", () => {
        expect(updateRecordWithAttachment.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });

    describe("Failure", () => {
      let updateRecordWithAttachment;

      before(() => {
        updateRecordWithAttachment = saga.updateRecordWithAttachment(
          "bucket", "collection", 1, record);
        updateRecordWithAttachment.next();
      });

      it("should dispatch an error notification action", () => {
        expect(updateRecordWithAttachment.throw("error").value)
          .eql(put(notifyError("error")));
      });

      it("should unmark the current collection as busy", () => {
        expect(updateRecordWithAttachment.next().value)
          .eql(put(collectionActions.collectionBusy(false)));
      });
    });
  });

  describe("deleteAttachment()", () => {
    let deleteAttachment;

    before(() => {
      deleteAttachment = saga.deleteAttachment("bucket", "collection", "record");
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

      it("should dispatch the listRecords action", () => {
        expect(bulkCreateRecords.next({published: records, errors: []}).value)
          .eql(put(collectionActions.listRecords("bucket", "collection")));
      });

      it("should update the route path", () => {
        expect(bulkCreateRecords.next().value)
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

      it("should dispatch the listRecords action", () => {
        expect(bulkCreateRecordsWithAttachment.next({
          published: recordsWithAttachment,
          errors: [],
        }).value)
          .eql(put(collectionActions.listRecords("bucket", "collection")));
      });

      it("should update the route path", () => {
        expect(bulkCreateRecordsWithAttachment.next().value)
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
        bulkCreateRecordsWithAttachment = saga.bulkCreateRecordsWithAttachment("bucket", "collection", records);
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
    describe("watchCollectionRecords()", () => {
      it("should watch for the listRecords action", () => {
        const watchCollectionRecords = saga.watchCollectionRecords();

        expect(watchCollectionRecords.next().value)
          .eql(take(COLLECTION_RECORDS_REQUEST));

        expect(watchCollectionRecords.next(
          collectionActions.listRecords("a", "b")).value)
          .eql(fork(saga.listRecords, "a", "b"));
      });
    });

    describe("watchRecordCreate()", () => {
      describe("Attachments enabled", () => {
        it("should watch for the createRecordWithAttachment action", () => {
          const watchRecordCreate = saga.watchRecordCreate();

          expect(watchRecordCreate.next().value)
            .eql(take(SESSION_SERVERINFO_SUCCESS));

          const serverInfoAction = {
            serverInfo: {capabilities: {attachments: {}}}
          };

          expect(watchRecordCreate.next(serverInfoAction).value)
            .eql(take(RECORD_CREATE_REQUEST));

          const record = {__attachment__: {}};
          expect(watchRecordCreate.next(
            collectionActions.createRecord("a", "b", record)).value)
            .eql(fork(saga.createRecordWithAttachment, "a", "b", record));
        });
      });

      describe("Attachments disabled", () => {
        it("should watch for the createRecord action", () => {
          const watchRecordCreate = saga.watchRecordCreate();

          expect(watchRecordCreate.next().value)
            .eql(take(SESSION_SERVERINFO_SUCCESS));

          const serverInfoAction = {
            serverInfo: {capabilities: {}}
          };

          expect(watchRecordCreate.next(serverInfoAction).value)
            .eql(take(RECORD_CREATE_REQUEST));

          expect(watchRecordCreate.next(
            collectionActions.createRecord("a", "b", "c")).value)
            .eql(fork(saga.createRecord, "a", "b", "c"));
        });
      });
    });

    describe("watchRecordUpdate()", () => {
      describe("Attachments enabled", () => {
        it("should watch for the updateRecordWithAttachment action", () => {
          const watchRecordUpdate = saga.watchRecordUpdate();

          expect(watchRecordUpdate.next().value)
            .eql(take(SESSION_SERVERINFO_SUCCESS));

          const serverInfoAction = {
            serverInfo: {capabilities: {attachments: {}}}
          };

          expect(watchRecordUpdate.next(serverInfoAction).value)
            .eql(take(RECORD_UPDATE_REQUEST));

          const record = {__attachment__: {}};
          expect(watchRecordUpdate.next(
            collectionActions.updateRecord("a", "b", "c", record)).value)
            .eql(fork(saga.updateRecordWithAttachment, "a", "b", "c", record));
        });
      });

      describe("Attachments disabled", () => {
        it("should watch for the updateRecord action", () => {
          const watchRecordUpdate = saga.watchRecordUpdate();

          expect(watchRecordUpdate.next().value)
            .eql(take(SESSION_SERVERINFO_SUCCESS));

          const serverInfoAction = {
            serverInfo: {capabilities: {}}
          };

          expect(watchRecordUpdate.next(serverInfoAction).value)
            .eql(take(RECORD_UPDATE_REQUEST));

          expect(watchRecordUpdate.next(
            collectionActions.updateRecord("a", "b", "c", "d")).value)
            .eql(fork(saga.updateRecord, "a", "b", "c", "d"));
        });
      });
    });

    describe("watchRecordDelete()", () => {
      it("should watch for the deleteRecord action", () => {
        const watchRecordDelete = saga.watchRecordDelete();

        expect(watchRecordDelete.next().value)
          .eql(take(RECORD_DELETE_REQUEST));

        expect(watchRecordDelete.next(
          collectionActions.deleteRecord("a", "b", "c")).value)
          .eql(fork(saga.deleteRecord, "a", "b", "c"));
      });
    });

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
