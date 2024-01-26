import * as actions from "@src/actions/record";
import { setClient } from "@src/client";
import * as saga from "@src/sagas/record";
import { mockNotifyError } from "@test/testUtils";
import { call, put } from "redux-saga/effects";

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
        expect(listHistory.next().value).toStrictEqual(
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
        expect(listHistory.next(result).value).toStrictEqual(
          put(actions.listRecordHistorySuccess(history))
        );
      });
    });

    describe("Failure", () => {
      let listHistory;

      beforeAll(() => {
        const action = actions.listRecordHistory(
          "bucket",
          "collection",
          "record"
        );
        listHistory = saga.listHistory(() => ({}), action);
        listHistory.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError();
        listHistory.throw("error");

        expect(mocked).toHaveBeenCalledWith(
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
        put(actions.listRecordHistorySuccess([], true, fakeNext))
      );
    });
  });
});
