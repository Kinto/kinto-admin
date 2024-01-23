import { put, call } from "redux-saga/effects";
import { mockNotifyError } from "../testUtils";
import * as actions from "../../src/actions/group";
import * as saga from "../../src/sagas/group";
import { setClient } from "../../src/client";

describe("group sagas", () => {
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
        const action = actions.listGroupHistory("bucket", "group");
        listHistory = saga.listHistory(() => ({}), action);
      });

      it("should fetch history on group", () => {
        expect(listHistory.next().value).toStrictEqual(
          call([client, client.listHistory], {
            filters: {
              group_id: "group",
            },
            limit: 200,
          })
        );
      });

      it("should dispatch the listGroupHistorySuccess action", () => {
        const history = [];
        const result = { data: history };
        expect(listHistory.next(result).value).toStrictEqual(
          put(actions.listGroupHistorySuccess(history))
        );
      });
    });

    describe("Failure", () => {
      let listHistory;

      beforeAll(() => {
        const action = actions.listGroupHistory("bucket", "group");
        listHistory = saga.listHistory(() => ({}), action);
        listHistory.next();
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError();
        listHistory.throw("error");
        expect(mocked).toHaveBeenCalledWith(
          "Couldn't list group history.",
          "error"
        );
      });
    });
  });

  describe("listNextHistory()", () => {
    let listNextHistory;

    const fakeNext = () => {};

    beforeAll(() => {
      const action = actions.listGroupNextHistory();
      const getState = () => ({ group: { history: { next: fakeNext } } });
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
      ).toStrictEqual(put(actions.listGroupHistorySuccess([], true, fakeNext)));
    });
  });
});
