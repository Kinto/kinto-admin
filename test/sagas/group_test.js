import { expect } from "chai";
import { put, call } from "redux-saga/effects";

import { notifyError } from "../../src/actions/notifications";
import * as actions from "../../src/actions/group";
import * as saga from "../../src/sagas/group";
import { setClient } from "../../src/client";
import { scrollToBottom } from "../../src/utils";

describe("group sagas", () => {
  const settings = {
    maxPerPage: 42,
  };

  describe("listHistory()", () => {
    describe("Success", () => {
      let client, listHistory;

      before(() => {
        client = { listHistory() {} };
        setClient({
          bucket() {
            return client;
          },
        });
        const action = actions.listGroupHistory("bucket", "group");
        listHistory = saga.listHistory(() => ({ settings }), action);
      });

      it("should fetch history on group", () => {
        expect(listHistory.next().value).eql(
          call([client, client.listHistory], {
            filters: {
              group_id: "group",
            },
            limit: 42,
            since: undefined,
          })
        );
      });

      it("should dispatch the listGroupHistorySuccess action", () => {
        const history = [];
        const result = { data: history };
        expect(listHistory.next(result).value).eql(
          put(actions.listGroupHistorySuccess(history))
        );
      });

      it("should filter from timestamp if provided", () => {
        const action = actions.listGroupHistory("bucket", "group", {
          since: 42,
        });
        const historySaga = saga.listHistory(() => ({ settings }), action);
        expect(historySaga.next().value).eql(
          call([client, client.listHistory], {
            filters: {
              group_id: "group",
            },
            since: 42,
            limit: 42,
          })
        );
      });
    });

    describe("Failure", () => {
      let listHistory;

      before(() => {
        const action = actions.listGroupHistory("bucket", "group");
        listHistory = saga.listHistory(() => ({ settings }), action);
        listHistory.next();
      });

      it("should dispatch an error notification action", () => {
        expect(listHistory.throw("error").value).eql(
          put(
            notifyError("Couldn't list group history.", "error", {
              clear: true,
            })
          )
        );
      });
    });
  });

  describe("listNextHistory()", () => {
    let listNextHistory;

    const fakeNext = () => {};

    before(() => {
      const action = actions.listGroupNextHistory();
      const getState = () => ({ group: { history: { next: fakeNext } } });
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
      ).eql(put(actions.listGroupHistorySuccess([], true, fakeNext)));
    });

    it("should scroll the window to the bottom", () => {
      expect(listNextHistory.next().value).eql(call(scrollToBottom));
    });
  });
});
