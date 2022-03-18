import sinon from "sinon";
import { expect } from "chai";
import { put, call } from "redux-saga/effects";

import { createSandbox, mockNotifyError } from "../test_utils";

import * as actions from "../../src/actions/record";
import * as saga from "../../src/sagas/record";
import { setClient } from "../../src/client";

describe("record sagas", () => {
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
        const action = actions.listRecordHistory(
          "bucket",
          "collection",
          "record"
        );
        listHistory = saga.listHistory(() => ({}), action);
      });

      it("should fetch history on record", () => {
        expect(listHistory.next().value).eql(
          call([client, client.listHistory], {
            limit: 200,
            filters: {
              collection_id: "collection",
              record_id: "record",
            },
          })
        );
      });

      it("should dispatch the listRecordHistorySuccess action", () => {
        const history = [];
        const result = { data: history };
        expect(listHistory.next(result).value).eql(
          put(actions.listRecordHistorySuccess(history))
        );
      });
    });

    describe("Failure", () => {
      let listHistory, sandbox;

      beforeAll(() => {
        const action = actions.listRecordHistory(
          "bucket",
          "collection",
          "record"
        );
        listHistory = saga.listHistory(() => ({}), action);
        listHistory.next();
        sandbox = createSandbox();
      });

      afterEach(() => {
        sandbox.restore();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError(sandbox);
        listHistory.throw("error");
        sinon.assert.calledWith(
          mocked,
          "Couldn't list record history.",
          "error"
        );
      });
    });
  });

  describe("listNextHistory()", () => {
    let listNextHistory;

    const fakeNext = () => {};

    beforeAll(() => {
      const action = actions.listRecordNextHistory();
      const getState = () => ({ record: { history: { next: fakeNext } } });
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
      ).eql(put(actions.listRecordHistorySuccess([], true, fakeNext)));
    });
  });
});
