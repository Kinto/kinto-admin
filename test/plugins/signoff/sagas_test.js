import { expect } from "chai";
import { put } from "redux-saga/effects";

import { notifySuccess } from "../../../src/actions/notifications";
import { routeLoadSuccess } from "../../../src/actions/route";
import { setClient } from "../../../src/client";
import * as actions from "../../../src/plugins/signoff/actions";
import * as saga from "../../../src/plugins/signoff/sagas";

describe("signoff plugin sagas", () => {
  let bucket, collection, getState;

  before(() => {
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

    before(() => {
      const action = actions.requestReview(":)");
      handleRequestReview = saga.handleRequestReview(getState, action);
    });

    it("should update the collection status as 'to-review'", () => {
      expect(handleRequestReview.next({ id: "coll" }).value).to.have
        .property("CALL")
        .to.have.property("args")
        .to.include({ status: "to-review", last_editor_comment: ":)" });
    });

    it("should refresh signoff resources status", () => {
      expect(
        handleRequestReview.next({
          data: { id: "coll", status: "to-review" },
        }).value
      ).to.have
        .property("CALL")
        .to.have.property("args")
        .to.include({ bid: "buck", cid: "coll" });
    });

    it("should dispatch the routeLoadSuccess action", () => {
      expect(
        handleRequestReview.next({
          data: { id: "coll", status: "to-review" },
        }).value
      ).eql(
        put(
          routeLoadSuccess({
            bucket: { data: { id: "buck" } },
            collection: { data: { id: "coll", status: "to-review" } },
          })
        )
      );
    });

    it("should dispatch a success notification", () => {
      expect(handleRequestReview.next().value).eql(
        put(notifySuccess("Review requested."))
      );
    });
  });

  describe("handleDeclineChanges()", () => {
    let handleDeclineChanges;

    before(() => {
      const action = actions.declineChanges(":(");
      handleDeclineChanges = saga.handleDeclineChanges(getState, action);
    });

    it("should update the collection status as 'work-in-progress'", () => {
      expect(handleDeclineChanges.next({ id: "coll" }).value).to.have
        .property("CALL")
        .to.have.property("args")
        .to.include({
          status: "work-in-progress",
          last_reviewer_comment: ":(",
        });
    });

    it("should refresh signoff resources status", () => {
      expect(
        handleDeclineChanges.next({
          data: { id: "coll", status: "work-in-progress" },
        }).value
      ).to.have
        .property("CALL")
        .to.have.property("args")
        .to.include({ bid: "buck", cid: "coll" });
    });

    it("should dispatch the routeLoadSuccess action", () => {
      expect(
        handleDeclineChanges.next({
          data: { id: "coll", status: "work-in-progress" },
        }).value
      ).eql(
        put(
          routeLoadSuccess({
            bucket: { data: { id: "buck" } },
            collection: { data: { id: "coll", status: "work-in-progress" } },
          })
        )
      );
    });

    it("should dispatch a success notification", () => {
      expect(handleDeclineChanges.next().value).eql(
        put(notifySuccess("Changes declined."))
      );
    });
  });

  describe("handleApproveChanges()", () => {
    let handleApproveChanges;

    before(() => {
      const action = actions.approveChanges();
      handleApproveChanges = saga.handleApproveChanges(getState, action);
    });

    it("should update the collection status as 'to-sign'", () => {
      expect(handleApproveChanges.next({ id: "coll" }).value).to.have
        .property("CALL")
        .to.have.property("args")
        .to.include({ status: "to-sign", last_reviewer_comment: "" });
    });

    it("should refresh signoff resources status", () => {
      expect(
        handleApproveChanges.next({
          data: { id: "coll", status: "to-sign" },
        }).value
      ).to.have
        .property("CALL")
        .to.have.property("args")
        .to.include({ bid: "buck", cid: "coll" });
    });

    it("should dispatch the routeLoadSuccess action", () => {
      expect(
        handleApproveChanges.next({
          data: { id: "coll", status: "to-sign" },
        }).value
      ).eql(
        put(
          routeLoadSuccess({
            bucket: { data: { id: "buck" } },
            collection: { data: { id: "coll", status: "to-sign" } },
          })
        )
      );
    });

    it("should dispatch a success notification", () => {
      expect(handleApproveChanges.next().value).eql(
        put(notifySuccess("Signature requested."))
      );
    });
  });
});
