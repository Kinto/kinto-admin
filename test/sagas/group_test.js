import { expect } from "chai";
import { put, call } from "redux-saga/effects";

import { notifyError } from "../../src/actions/notifications";
import * as actions from "../../src/actions/group";
import * as saga from "../../src/sagas/group";
import { setClient } from "../../src/client";


describe("group sagas", () => {
  describe("listHistory()", () => {
    describe("Success", () => {
      let client, listHistory;

      before(() => {
        client = {listHistory() {}};
        setClient({bucket(){ return client; }});
        const action = actions.listGroupHistory("bucket", "group");
        listHistory = saga.listHistory(() => {}, action);
      });

      it("should fetch history on group", () => {
        expect(listHistory.next().value)
          .eql(call([client, client.listHistory], {
            filters: {
              group_id: "group",
            },
            since: undefined
          }));
      });

      it("should dispatch the listGroupHistorySuccess action", () => {
        const history = [];
        const result = {data: history};
        expect(listHistory.next(result).value)
          .eql(put(actions.listGroupHistorySuccess(history)));
      });

      it("should filter from timestamp if provided", () => {
        const action = actions.listGroupHistory("bucket", "group", 42);
        const historySaga = saga.listHistory(() => {}, action);
        expect(historySaga.next().value)
          .eql(call([client, client.listHistory], {
            filters: {
              group_id: "group",
            },
            since: 42
          }));
      });
    });

    describe("Failure", () => {
      let listHistory;

      before(() => {
        const action = actions.listGroupHistory("bucket", "group");
        listHistory = saga.listHistory(() => {}, action);
        listHistory.next();
      });

      it("should dispatch an error notification action", () => {
        expect(listHistory.throw("error").value)
          .eql(put(notifyError("Couldn't list group history.", "error", {clear: true})));
      });
    });
  });
});
