import { expect } from "chai";
import { put, call } from "redux-saga/effects";

import { notifyError } from "../../src/actions/notifications";
import * as actions from "../../src/actions/record";
import * as saga from "../../src/sagas/record";
import { setClient } from "../../src/client";


describe("record sagas", () => {
  describe("listHistory()", () => {
    describe("Success", () => {
      let client, listHistory;

      before(() => {
        client = {listHistory() {}};
        setClient({bucket(){ return client; }});
        const action = actions.listRecordHistory("bucket", "collection", "record");
        listHistory = saga.listHistory(() => {}, action);
      });

      it("should fetch history on record", () => {
        expect(listHistory.next().value)
          .eql(call([client, client.listHistory], {
            since: undefined,
            filters: {
              collection_id: "collection",
              record_id: "record",
            }
          }));
      });

      it("should filter from timestamp if provided", () => {
        const action = actions.listRecordHistory("bucket", "collection", "record", {since: 42});
        const historySaga = saga.listHistory(() => {}, action);
        expect(historySaga.next().value)
          .eql(call([client, client.listHistory], {
            filters: {
              collection_id: "collection",
              record_id: "record",
            },
            since: 42
          }));
      });

      it("should dispatch the listRecordHistorySuccess action", () => {
        const history = [];
        const result = {data: history};
        expect(listHistory.next(result).value)
          .eql(put(actions.listRecordHistorySuccess(history)));
      });

    });

    describe("Failure", () => {
      let listHistory;

      before(() => {
        const action = actions.listRecordHistory("bucket", "collection", "record");
        listHistory = saga.listHistory(() => {}, action);
        listHistory.next();
      });

      it("should dispatch an error notification action", () => {
        expect(listHistory.throw("error").value)
          .eql(put(notifyError("Couldn't list record history.", "error", {clear: true})));
      });
    });
  });
});
