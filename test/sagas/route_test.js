import { expect } from "chai";
import { take, fork, put } from "redux-saga/effects";

import {
  SESSION_SETUP_COMPLETE,
  ROUTE_LOAD_REQUEST,
} from "../../scripts/constants";
import { notifyError } from "../../scripts/actions/notifications";
import { setClient } from "../../scripts/client";
import * as actions from "../../scripts/actions/route";
import * as collectionActions from "../../scripts/actions/collection";
import * as bucketActions from "../../scripts/actions/bucket";
import * as recordActions from "../../scripts/actions/record";
import * as saga from "../../scripts/sagas/route";


describe("route sagas", () => {
  describe("loadRoute()", () => {
    describe("Nothing to load", () => {
      it("should do nothing", () => {
        const loadRoute = saga.loadRoute();

        expect(loadRoute.next().done).eql(true);
      });
    });

    describe("Failure", () => {
      it("should dispatch an error notification action", () => {
        const loadRoute = saga.loadRoute("bucket");
        loadRoute.next();

        expect(loadRoute.throw("error").value)
          .eql(put(notifyError("error")));
      });
    });

    describe("Bucket to load", () => {
      let batch, loadRoute;

      before(() => {
        batch = () => {};
        setClient({batch});
        loadRoute = saga.loadRoute("bucket");
      });

      it("should reset the selected bucket", () => {
        expect(loadRoute.next().value)
          .eql(put(bucketActions.resetBucket()));
      });

      it("should mark the selected bucket as busy", () => {
        expect(loadRoute.next().value)
          .eql(put(bucketActions.bucketBusy(true)));
      });

      it("should batch fetch resources data", () => {
        expect(loadRoute.next().value)
          .to.have.property("CALL")
          .to.have.property("context")
          .to.have.property("batch").eql(batch);
      });

      it("should update bucket state from response data", () => {
        const responses = [
          {status: 200, body: {data: {id: "bucket", a: 1}}}
        ];
        expect(loadRoute.next(responses).value)
          .eql(put(bucketActions.bucketLoadSuccess("bucket", {
            id: "bucket",
            a: 1
          })));
      });
    });

    describe("Bucket and collection to load", () => {
      let batch, loadRoute;

      before(() => {
        batch = () => {};
        setClient({batch});
        loadRoute = saga.loadRoute("bucket", "collection");
      });

      it("should reset the selected bucket", () => {
        expect(loadRoute.next().value)
          .eql(put(bucketActions.resetBucket()));
      });

      it("should mark the selected bucket as busy", () => {
        expect(loadRoute.next().value)
          .eql(put(bucketActions.bucketBusy(true)));
      });

      it("should reset the selected collection", () => {
        expect(loadRoute.next().value)
          .eql(put(collectionActions.resetCollection()));
      });

      it("should mark the selected collection as busy", () => {
        expect(loadRoute.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should batch fetch resources data", () => {
        expect(loadRoute.next().value)
          .to.have.property("CALL")
          .to.have.property("context")
          .to.have.property("batch").eql(batch);
      });

      it("should update bucket state from response data", () => {
        const responses = [
          {status: 200, body: {data: {id: "bucket", a: 1}}},
          {status: 200, body: {data: {id: "collection", a: 2}}},
        ];
        expect(loadRoute.next(responses).value)
          .eql(put(bucketActions.bucketLoadSuccess("bucket", {
            id: "bucket",
            a: 1
          })));
      });

      it("should update collection state from response data", () => {
        expect(loadRoute.next().value)
          .eql(put(collectionActions.collectionLoadSuccess({
            id: "collection",
            bucket: "bucket",
            a: 2
          })));
      });
    });

    describe("Bucket, collection and record to load", () => {
      let batch, loadRoute;

      before(() => {
        batch = () => {};
        setClient({batch});
        loadRoute = saga.loadRoute("bucket", "collection", "record");
      });

      it("should reset the selected bucket", () => {
        expect(loadRoute.next().value)
          .eql(put(bucketActions.resetBucket()));
      });

      it("should mark the selected bucket as busy", () => {
        expect(loadRoute.next().value)
          .eql(put(bucketActions.bucketBusy(true)));
      });

      it("should reset the selected collection", () => {
        expect(loadRoute.next().value)
          .eql(put(collectionActions.resetCollection()));
      });

      it("should mark the selected collection as busy", () => {
        expect(loadRoute.next().value)
          .eql(put(collectionActions.collectionBusy(true)));
      });

      it("should reset the selected record", () => {
        expect(loadRoute.next().value)
          .eql(put(recordActions.resetRecord()));
      });

      it("should batch fetch resources data", () => {
        expect(loadRoute.next().value)
          .to.have.property("CALL")
          .to.have.property("context")
          .to.have.property("batch").eql(batch);
      });

      it("should update bucket state from response data", () => {
        const responses = [
          {status: 200, body: {data: {id: "bucket", a: 1}}},
          {status: 200, body: {data: {id: "collection", a: 2}}},
          {status: 200, body: {data: {id: "record", a: 3}}},
        ];
        expect(loadRoute.next(responses).value)
          .eql(put(bucketActions.bucketLoadSuccess("bucket", {
            id: "bucket",
            a: 1
          })));
      });

      it("should update collection state from response data", () => {
        expect(loadRoute.next().value)
          .eql(put(collectionActions.collectionLoadSuccess({
            id: "collection",
            bucket: "bucket",
            a: 2
          })));
      });

      it("should update record state from response data", () => {
        expect(loadRoute.next().value)
          .eql(put(recordActions.recordLoadSuccess({
            id: "record",
            a: 3
          })));
      });
    });
  });

  describe("Watchers", () => {
    describe("watchLoadRoute()", () => {
      it("should watch for the deleteCollection action", () => {
        const watchLoadRoute = saga.watchLoadRoute();

        expect(watchLoadRoute.next().value)
          .eql(take(SESSION_SETUP_COMPLETE));

        expect(watchLoadRoute.next().value)
          .eql(take(ROUTE_LOAD_REQUEST));

        expect(watchLoadRoute.next(
          actions.loadRoute("a", "b", "c")).value)
          .eql(fork(saga.loadRoute, "a", "b", "c"));
      });
    });
  });
});
