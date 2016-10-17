import { expect } from "chai";
import { push as updatePath } from "react-router-redux";
import { call, put, take } from "redux-saga/effects";

import { notifyError } from "../../src/actions/notifications";
import { setClient } from "../../src/client";
import * as actions from "../../src/actions/route";
import * as notificationActions from "../../src/actions/notifications";
import * as sessionActions from "../../src/actions/session";
import * as saga from "../../src/sagas/route";

import { SESSION_AUTHENTICATED } from "../../src/constants";


describe("route sagas", () => {
  describe("loadRoute()", () => {
    describe("Nothing to load", () => {
      it("should do nothing", () => {
        const loadRoute = saga.loadRoute({});

        expect(loadRoute.next().done).eql(true);
      });
    });

    describe("Failure", () => {
      let loadRoute;

      before(() => {
        const batch = () => {};
        setClient({batch});
        loadRoute = saga.loadRoute({bid: "bucket"});
        loadRoute.next();
      });

      it("should dispatch the routeLoadFailure action", () => {
        expect(loadRoute.throw("error").value)
          .eql(put(actions.routeLoadFailure()));
      });

      it("should dispatch an error notification action", () => {
        expect(loadRoute.next().value)
          .eql(put(notifyError("Couldn't retrieve route resources.", "error")));
      });
    });

    describe("Bucket + Collection + Record", () => {
      let batch, loadRoute;

      const params = {
        bid: "bucket",
        cid: "collection",
        rid: "record",
      };

      const bucket = {
        data: {id: "bucket", a: 1},
        permissions: {write: [1], read: [2]}
      };

      const collection = {
        data: {id: "collection", a: 1},
        permissions: {write: [1], read: [2]}
      };

      const record = {
        data: {id: "record", a: 1},
        permissions: {write: [1], read: [2]}
      };

      before(() => {
        batch = () => {};
        setClient({batch});
        loadRoute = saga.loadRoute(params);
      });

      it("should dispatch the routeLoadRequest action", () => {
        expect(loadRoute.next().value)
          .eql(put(actions.routeLoadRequest(params)));
      });

      it("should batch fetch resources data", () => {
        expect(loadRoute.next().value)
          .to.have.property("CALL")
          .to.have.property("context")
          .to.have.property("batch").eql(batch);
      });

      it("should update bucket state from response data", () => {
        const responses = [
          {status: 200, body: bucket},
          {status: 200, body: collection},
          {status: 200, body: record},
        ];

        expect(loadRoute.next(responses).value)
          .eql(put(actions.routeLoadSuccess({
            bucket,
            collection,
            record,
            group: null,
          })));
      });
    });

    describe("Unauthorized bucket access", () => {
      let batch, loadRoute;

      const params = {
        bid: "bucket",
      };

      before(() => {
        batch = () => {};
        setClient({batch});
        loadRoute = saga.loadRoute(params);
      });

      it("should dispatch the routeLoadRequest action", () => {
        expect(loadRoute.next().value)
          .eql(put(actions.routeLoadRequest(params)));
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
          .eql(put(actions.routeLoadSuccess({
            bucket: {
              data: {id: "bucket"},
              permissions: {read: [], write: []}
            },
            collection: null,
            group: null,
            record: null,
          })));
      });
    });

    describe("Bucket not found", () => {
      let batch, loadRoute;

      const params = {
        bid: "bucket",
      };

      before(() => {
        batch = () => {};
        setClient({batch});
        loadRoute = saga.loadRoute(params);
      });

      it("should dispatch the routeLoadRequest action", () => {
        expect(loadRoute.next().value)
          .eql(put(actions.routeLoadRequest(params)));
      });

      it("should batch fetch resources data", () => {
        expect(loadRoute.next().value)
          .to.have.property("CALL")
          .to.have.property("context")
          .to.have.property("batch").eql(batch);
      });

      it("should dispatch the failure action", () => {
        const responses = [
          {status: 404, body: {}}
        ];
        expect(loadRoute.next(responses).value)
          .eql(put(actions.routeLoadFailure()));
      });

      it("should dispatch a notification", () => {
        expect(loadRoute.next().value)
          .eql(put(notificationActions.notifyError(
            "Couldn't retrieve route resources.",
            new Error("Bucket bucket does not exist."))));
      });
    });
  });

  describe("routeUpdated()", () => {
    describe("Not authenticated", () => {
      let routeUpdated;

      before(() => {
        const getState = () => ({session: {authenticated: false}});
        const action = actions.routeUpdated({}, {pathname: "/blah"});
        routeUpdated = saga.routeUpdated(getState, action);
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

      it("should wait for the SESSION_AUTHENTICATED event", () => {
        expect(routeUpdated.next().value)
          .eql(take(SESSION_AUTHENTICATED));
      });

      it("should clear the notification", () => {
        expect(routeUpdated.next().value)
          .eql(put(notificationActions.clearNotifications({force: true})));
      });

      it("should redirect the user to the initially requested URL", () => {
        expect(routeUpdated.next().value)
          .eql(put(updatePath("/blah")));
      });

      it("should remove previously stored redirect URL", () => {
        expect(routeUpdated.next().value)
          .eql(put(sessionActions.storeRedirectURL(null)));
      });
    });

    describe("Authenticated", () => {
      let routeUpdated;
      const params = {bid: "bucket", cid: "collection", rid: "record"};

      before(() => {
        const getState = () => ({session: {authenticated: true}});
        const action = actions.routeUpdated(params, {pathname: "/"});
        routeUpdated = saga.routeUpdated(getState, action);
      });

      it("should clear notification", () => {
        expect(routeUpdated.next().value)
          .eql(put(notificationActions.clearNotifications()));
      });

      it("should load route resources", () => {
        expect(routeUpdated.next().value)
          .eql(call(saga.loadRoute, params));
      });

      it("should scroll window to top", () => {
        expect(routeUpdated.next().value)
          .eql(call([window, window.scrollTo], 0, 0));
      });
    });
  });
});
