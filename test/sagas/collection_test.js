import { expect } from "chai";
import { push as updatePath } from "react-router-redux";
import { take, fork, put, call } from "redux-saga/effects";

import {
  COLLECTION_RECORDS_REQUEST,
  RECORD_LOAD_REQUEST,
  RECORD_CREATE_REQUEST,
  RECORD_UPDATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_BULK_CREATE_REQUEST,
} from "../../scripts/constants";
import { notifyError, notifySuccess } from "../../scripts/actions/notifications";
import * as collectionActions from "../../scripts/actions/collection";
import * as recordActions from "../../scripts/actions/record";
import * as saga from "../../scripts/sagas/collection";
import { setClient } from "../../scripts/client";

const record = {id: 1, foo: "bar1"};
const records = [
  record,
  {id: 2, foo: "bar2"},
];

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
          .eql(call([collection, collection.updateRecord], record));
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
          .eql(put(notifySuccess("Record added.")));
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

    describe("watchRecordLoad()", () => {
      it("should watch for the loadRecord action", () => {
        const watchRecordLoad = saga.watchRecordLoad();

        expect(watchRecordLoad.next().value)
          .eql(take(RECORD_LOAD_REQUEST));

        expect(watchRecordLoad.next(
          collectionActions.loadRecord("a", "b", "c")).value)
          .eql(fork(saga.loadRecord, "a", "b", "c"));
      });
    });

    describe("watchRecordCreate()", () => {
      it("should watch for the createRecord action", () => {
        const watchRecordCreate = saga.watchRecordCreate();

        expect(watchRecordCreate.next().value)
          .eql(take(RECORD_CREATE_REQUEST));

        expect(watchRecordCreate.next(
          collectionActions.createRecord("a", "b", "c")).value)
          .eql(fork(saga.createRecord, "a", "b", "c"));
      });
    });

    describe("watchRecordUpdate()", () => {
      it("should watch for the updateRecord action", () => {
        const watchRecordUpdate = saga.watchRecordUpdate();

        expect(watchRecordUpdate.next().value)
          .eql(take(RECORD_UPDATE_REQUEST));

        expect(watchRecordUpdate.next(
          collectionActions.updateRecord("a", "b", "c", "d")).value)
          .eql(fork(saga.updateRecord, "a", "b", "c", "d"));
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
      it("should watch for the bulkCreateRecords action", () => {
        const watchBulkCreateRecords = saga.watchBulkCreateRecords();

        expect(watchBulkCreateRecords.next().value)
          .eql(take(RECORD_BULK_CREATE_REQUEST));

        expect(watchBulkCreateRecords.next(
          collectionActions.bulkCreateRecords("a", "b", "c")).value)
          .eql(fork(saga.bulkCreateRecords, "a", "b", "c"));
      });
    });
  });
});
