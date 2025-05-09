import * as collection_actions from "@src/actions/collection";
import { routeLoadSuccess } from "@src/actions/route";
import * as actions from "@src/actions/signoff";
import { setClient } from "@src/client";
import * as saga from "@src/sagas/signoff";
import { mockNotifyError, mockNotifySuccess } from "@test/testUtils";
import { call, put } from "redux-saga/effects";

describe("Signoff sagas", () => {
  let notifyErrorMock, notifySuccessMock;
  beforeEach(() => {
    notifyErrorMock = mockNotifyError();
    notifySuccessMock = mockNotifySuccess();
  });

  describe("review actions", () => {
    let bucket, collection, getState;

    beforeAll(() => {
      collection = {
        getData() {},
        setData() {},
      };
      bucket = {
        collection() {
          return collection;
        },
      };
      setClient({
        bucket() {
          return bucket;
        },
      });
      getState = () => ({
        bucket: { data: { id: "buck" } },
        collection: { data: { id: "coll", last_modified: 42 } },
        signoff: { resource: { destination: { lastSigned: 53 } } },
      });
    });

    describe("handleRequestReview()", () => {
      let handleRequestReview;

      beforeAll(() => {
        const action = actions.requestReview(":)");
        handleRequestReview = saga.handleRequestReview(getState, action);
      });

      it("should update the collection status as 'to-review'", () => {
        expect(handleRequestReview.next({ id: "coll" }).value).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            { status: "to-review", last_editor_comment: ":)" },
          ])
        );
      });

      it("should refresh signoff resources status", () => {
        expect(
          handleRequestReview.next({
            data: { id: "coll", status: "to-review" },
          }).value
        ).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            collection_actions.listRecords("buck", "coll"),
          ])
        );
      });

      it("should dispatch the routeLoadSuccess action and send a notification", () => {
        expect(
          handleRequestReview.next({
            data: { id: "coll", status: "to-review" },
          }).value
        ).toStrictEqual(
          put(
            routeLoadSuccess({
              bucket: { data: { id: "buck" } },
              collection: { data: { id: "coll", status: "to-review" } },
              groups: [],
              group: null,
              record: null,
            })
          )
        );
        handleRequestReview.next();
        expect(notifySuccessMock).toHaveBeenCalledWith("Review requested.");
      });
    });

    describe("handleDeclineChanges()", () => {
      let handleDeclineChanges;

      beforeAll(() => {
        const action = actions.declineChanges(":(");
        handleDeclineChanges = saga.handleDeclineChanges(getState, action);
      });

      it("should update the collection status as 'work-in-progress'", () => {
        expect(handleDeclineChanges.next({ id: "coll" }).value).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            {
              status: "work-in-progress",
              last_reviewer_comment: ":(",
            },
          ])
        );
      });

      it("should refresh signoff resources status", () => {
        expect(
          handleDeclineChanges.next({
            data: { id: "coll", status: "work-in-progress" },
          }).value
        ).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            collection_actions.listRecords("buck", "coll"),
          ])
        );
      });

      it("should dispatch the routeLoadSuccess action", () => {
        expect(
          handleDeclineChanges.next({
            data: { id: "coll", status: "work-in-progress" },
          }).value
        ).toStrictEqual(
          put(
            routeLoadSuccess({
              bucket: { data: { id: "buck" } },
              collection: { data: { id: "coll", status: "work-in-progress" } },
              groups: [],
              group: null,
              record: null,
            })
          )
        );
        handleDeclineChanges.next();
        expect(notifySuccessMock).toHaveBeenCalledWith("Changes declined.");
      });
    });

    describe("handleApproveChanges()", () => {
      let handleApproveChanges;

      beforeAll(() => {
        const action = actions.approveChanges();
        handleApproveChanges = saga.handleApproveChanges(getState, action);
      });

      it("should update the collection status as 'to-sign'", () => {
        expect(handleApproveChanges.next({ id: "coll" }).value).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            { status: "to-sign", last_reviewer_comment: "" },
          ])
        );
      });

      it("should refresh signoff resources status", () => {
        expect(
          handleApproveChanges.next({
            data: { id: "coll", status: "to-sign" },
          }).value
        ).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            collection_actions.listRecords("buck", "coll"),
          ])
        );
      });

      it("should dispatch the routeLoadSuccess action", () => {
        expect(
          handleApproveChanges.next({
            data: { id: "coll", status: "to-sign" },
          }).value
        ).toStrictEqual(
          put(
            routeLoadSuccess({
              bucket: { data: { id: "buck" } },
              collection: { data: { id: "coll", status: "to-sign" } },
              groups: [],
              group: null,
              record: null,
            })
          )
        );
        handleApproveChanges.next();
        expect(notifySuccessMock).toHaveBeenCalledWith("Signature requested.");
      });
    });

    describe("handleRollbackChanges()", () => {
      let handleRollbackChanges;

      beforeAll(() => {
        const action = actions.rollbackChanges("start over");
        handleRollbackChanges = saga.handleRollbackChanges(getState, action);
      });

      it("should update the collection status as 'to-rollback'", () => {
        expect(handleRollbackChanges.next({ id: "coll" }).value).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            {
              status: "to-rollback",
              last_editor_comment: "start over",
            },
          ])
        );
      });

      it("should refresh signoff resources status", () => {
        expect(
          handleRollbackChanges.next({
            data: { id: "coll", status: "to-rollback" },
          }).value
        ).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            collection_actions.listRecords("buck", "coll"),
          ])
        );
      });

      it("should dispatch the routeLoadSuccess action", () => {
        expect(
          handleRollbackChanges.next({
            data: { id: "coll", status: "to-rollback" },
          }).value
        ).toStrictEqual(
          put(
            routeLoadSuccess({
              bucket: { data: { id: "buck" } },
              collection: { data: { id: "coll", status: "to-rollback" } },
              groups: [],
              group: null,
              record: null,
            })
          )
        );
        handleRollbackChanges.next();
        expect(notifySuccessMock).toHaveBeenCalledWith(
          "Changes were rolled back."
        );
      });
    });
  });
});
