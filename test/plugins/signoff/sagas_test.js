import { expect } from "chai";
import { put } from "redux-saga/effects";

import { notifySuccess } from "../../../src/actions/notifications";
import { routeLoadSuccess } from "../../../src/actions/route";
import { setClient } from "../../../src/client";
import * as actions from "../../../src/plugins/signoff/actions";
import * as saga from "../../../src/plugins/signoff/sagas";


describe("signoff plugin sagas", () => {
  describe("handleRequestReview()", () => {
    let bucket, collection, getState, handleRequestReview;

    before(() => {
      collection = {
        getData() {},
        setData() {},
      };
      bucket = {collection() {return collection;}};
      setClient({bucket() {return bucket;}});
      const action = actions.requestReview();
      getState = () => ({
        bucket: {data: {id: "buck"}},
        collection: {data: {id: "coll", last_modified: 42}}
      });
      handleRequestReview = saga.handleRequestReview(getState, action);
    });

    it("should update the collection status as 'to-review'", () => {
      expect(handleRequestReview.next({id: "coll"}).value)
        .to.have.property("CALL")
        .to.have.property("args")
        .to.include({status: "to-review"});
    });

    it("should dispatch the routeLoadSuccess action", () => {
      expect(handleRequestReview.next({data: {id: "coll", status: "to-review"}}).value)
        .eql(put(routeLoadSuccess({
          bucket: {data: {id: "buck"}},
          collection: {data: {id: "coll", status: "to-review"}},
        })));
    });

    it("should dispatch a success notification", () => {
      expect(handleRequestReview.next().value)
        .eql(put(notifySuccess("Review requested.")));
    });
  });

  describe("handleDeclineChanges()", () => {
    let bucket, collection, getState, handleDeclineChanges;

    before(() => {
      collection = {
        getData() {},
        setData() {},
      };
      bucket = {collection() {return collection;}};
      setClient({bucket() {return bucket;}});
      const action = actions.requestReview();
      getState = () => ({
        bucket: {data: {id: "buck"}},
        collection: {data: {id: "coll", last_modified: 42}}
      });
      handleDeclineChanges = saga.handleDeclineChanges(getState, action);
    });

    it("should update the collection status as 'work-in-progress'", () => {
      expect(handleDeclineChanges.next({id: "coll"}).value)
        .to.have.property("CALL")
        .to.have.property("args")
        .to.include({status: "work-in-progress"});
    });

    it("should dispatch the routeLoadSuccess action", () => {
      expect(handleDeclineChanges.next({data: {id: "coll", status: "work-in-progress"}}).value)
        .eql(put(routeLoadSuccess({
          bucket: {data: {id: "buck"}},
          collection: {data: {id: "coll", status: "work-in-progress"}},
        })));
    });

    it("should dispatch a success notification", () => {
      expect(handleDeclineChanges.next().value)
        .eql(put(notifySuccess("Changes declined.")));
    });
  });

  describe("handleApproveChanges()", () => {
    let bucket, collection, getState, handleApproveChanges;

    before(() => {
      collection = {
        getData() {},
        setData() {},
      };
      bucket = {collection() {return collection;}};
      setClient({bucket() {return bucket;}});
      const action = actions.requestReview();
      getState = () => ({
        bucket: {data: {id: "buck"}},
        collection: {data: {id: "coll", last_modified: 42}}
      });
      handleApproveChanges = saga.handleApproveChanges(getState, action);
    });

    it("should update the collection status as 'to-sign'", () => {
      expect(handleApproveChanges.next({id: "coll"}).value)
        .to.have.property("CALL")
        .to.have.property("args")
        .to.include({status: "to-sign"});
    });

    it("should dispatch the routeLoadSuccess action", () => {
      expect(handleApproveChanges.next({data: {id: "coll", status: "to-sign"}}).value)
        .eql(put(routeLoadSuccess({
          bucket: {data: {id: "buck"}},
          collection: {data: {id: "coll", status: "to-sign"}},
        })));
    });

    it("should dispatch a success notification", () => {
      expect(handleApproveChanges.next().value)
        .eql(put(notifySuccess("Signature requested.")));
    });
  });
});
