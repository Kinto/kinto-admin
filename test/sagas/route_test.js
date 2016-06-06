import { expect } from "chai";
import { push as updatePath } from "react-router-redux";
import { take, call, put } from "redux-saga/effects";

import { ROUTE_UPDATED } from "../../scripts/constants";
import { notifyError } from "../../scripts/actions/notifications";
import { setClient } from "../../scripts/client";
import * as actions from "../../scripts/actions/route";
import * as notificationActions from "../../scripts/actions/notifications";
import * as sessionActions from "../../scripts/actions/session";
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

    describe("Failed bucket loading", () => {
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
          {status: 403, body: {}}
        ];
        expect(loadRoute.next(responses).value)
          .eql(put(bucketActions.bucketLoadSuccess("bucket", {
            id: "bucket",
          }, {
            write: [],
            read: [],
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
          {status: 200, body: {data: {id: "bucket", a: 1},
                               permissions: {write: [1], read: [2]}}},
          {status: 200, body: {data: {id: "collection", a: 2},
                               permissions: {write: [2], read: [3]}}},
        ];
        expect(loadRoute.next(responses).value)
          .eql(put(bucketActions.bucketLoadSuccess("bucket", {
            id: "bucket",
            a: 1
          }, {write: [1], read: [2]})));
      });

      it("should update collection state from response data", () => {
        expect(loadRoute.next().value)
          .eql(put(collectionActions.collectionLoadSuccess({
            id: "collection",
            bucket: "bucket",
            a: 2
          }, {write: [2], read: [3]})));
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

  describe("routeUpdated()", () => {
    describe("Not authenticated", () => {
      let routeUpdated;

      before(() => {
        routeUpdated = saga.routeUpdated(false, {}, {pathname: "/blah"});
      });

      it("should clear notification", () => {
        expect(routeUpdated.next().value)
          .eql(put(notificationActions.clearNotifications()));
      });

      it("should store the post-auth redirect URL", () => {
        expect(routeUpdated.next().value)
          .eql(put(sessionActions.storeRedirectURL("/blah")));
      });

      it("should redirect to the homepage", () => {
        expect(routeUpdated.next().value)
          .eql(put(updatePath("")));
      });

      it("should dispatch a notification", () => {
        expect(routeUpdated.next().value)
          .eql(put(notificationActions.notifyInfo("Authentication required.", {
            persistent: true
          })));
      });
    });

    describe("Authenticated", () => {
      let routeUpdated;
      const params = {bid: "bucket", cid: "collection", rid: "record"};

      before(() => {
        routeUpdated = saga.routeUpdated(true, params, {pathname: "/"});
      });

      it("should clear notification", () => {
        expect(routeUpdated.next().value)
          .eql(put(notificationActions.clearNotifications()));
      });

      it("should load route resources", () => {
        expect(routeUpdated.next().value)
          .eql(call(saga.loadRoute, params.bid, params.cid, params.rid));
      });

      it("should scroll window to top", () => {
        expect(routeUpdated.next().value)
          .eql(call([window, window.scrollTo], 0, 0));
      });
    });
  });

  describe("Watchers", () => {
    describe("watchRouteUpdated()", () => {
      it("should watch for the deleteCollection action", () => {
        const watchRouteUpdated = saga.watchRouteUpdated();

        expect(watchRouteUpdated.next().value)
          .eql(take(ROUTE_UPDATED));

        expect(watchRouteUpdated.next(
          actions.routeUpdated("a", "b", "c")).value)
          .eql(call(saga.routeUpdated, "a", "b", "c"));
      });
    });
  });
});
