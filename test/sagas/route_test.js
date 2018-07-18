import sinon from "sinon";
import { expect } from "chai";
import { push as updatePath } from "connected-react-router";
import { call, put, take } from "redux-saga/effects";

import { createSandbox, mockNotifyError } from "../test_utils";

import { setClient } from "../../src/client";
import * as actions from "../../src/actions/route";
import * as notificationActions from "../../src/actions/notifications";
import * as sessionActions from "../../src/actions/session";
import * as saga from "../../src/sagas/route";
import { scrollToTop } from "../../src/utils";
import { SESSION_AUTHENTICATED } from "../../src/constants";

describe("route sagas", () => {
  let sandbox;

  beforeAll(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("loadRoute()", () => {
    describe("Nothing to load", () => {
      it("should do nothing", () => {
        const loadRoute = saga.loadRoute({});

        expect(loadRoute.next().done).eql(true);
      });
    });

    describe("Failure", () => {
      let loadRoute;

      beforeAll(() => {
        const batch = () => {};
        setClient({ batch });
        loadRoute = saga.loadRoute({ bid: "bucket" });
        loadRoute.next();
      });

      it("should dispatch the routeLoadFailure action", () => {
        expect(loadRoute.throw("error").value).eql(
          put(actions.routeLoadFailure())
        );
      });

      it("should dispatch an error notification action", () => {
        const mocked = mockNotifyError(sandbox);
        loadRoute.next();
        sinon.assert.calledWith(
          mocked,
          "Couldn't retrieve route resources.",
          "error"
        );
      });
    });

    describe("Route loading", () => {
      let batch, loadRoute;

      const bucket = {
        data: { id: "bucket", a: 1 },
        permissions: { write: [1], read: [2] },
      };

      const groups = {
        data: [{ id: "gid1", members: ["a", "b"] }],
      };

      const collection = {
        data: { id: "collection", a: 1 },
        permissions: { write: [1], read: [2] },
      };

      const group = {
        data: { id: "group", members: ["ha"] },
        permissions: { write: [1], read: [2] },
      };

      const record = {
        data: { id: "record", a: 1 },
        permissions: { write: [1], read: [2] },
      };

      describe("Bucket", () => {
        const params = {
          bid: "bucket",
        };

        beforeAll(() => {
          batch = () => {};
          setClient({ batch });
          loadRoute = saga.loadRoute(params);
        });

        it("should dispatch the routeLoadRequest action", () => {
          expect(loadRoute.next().value).eql(
            put(actions.routeLoadRequest(params))
          );
        });

        it("should batch fetch resources data", () => {
          expect(loadRoute.next().value)
            .to.have.property("CALL")
            .to.have.property("context")
            .to.have.property("batch")
            .eql(batch);
        });

        it("should update bucket state from response data", () => {
          const responses = [
            { status: 200, body: bucket },
            { status: 200, body: groups },
          ];

          expect(loadRoute.next(responses).value).eql(
            put(
              actions.routeLoadSuccess({
                bucket,
                groups: groups.data,
                collection: null,
                record: null,
                group: null,
              })
            )
          );
        });
      });

      describe("Bucket + Collection", () => {
        const params = {
          bid: "bucket",
          cid: "collection",
        };

        beforeAll(() => {
          batch = () => {};
          setClient({ batch });
          loadRoute = saga.loadRoute(params);
        });

        it("should dispatch the routeLoadRequest action", () => {
          expect(loadRoute.next().value).eql(
            put(actions.routeLoadRequest(params))
          );
        });

        it("should batch fetch resources data", () => {
          expect(loadRoute.next().value)
            .to.have.property("CALL")
            .to.have.property("context")
            .to.have.property("batch")
            .eql(batch);
        });

        it("should update bucket state from response data", () => {
          const responses = [
            { status: 200, body: bucket },
            { status: 200, body: groups },
            { status: 200, body: collection },
          ];

          expect(loadRoute.next(responses).value).eql(
            put(
              actions.routeLoadSuccess({
                bucket,
                groups: groups.data,
                collection,
                record: null,
                group: null,
              })
            )
          );
        });
      });

      describe("Bucket + Group", () => {
        const params = {
          bid: "bucket",
          gid: "group",
        };

        beforeAll(() => {
          batch = () => {};
          setClient({ batch });
          loadRoute = saga.loadRoute(params);
        });

        it("should dispatch the routeLoadRequest action", () => {
          expect(loadRoute.next().value).eql(
            put(actions.routeLoadRequest(params))
          );
        });

        it("should batch fetch resources data", () => {
          expect(loadRoute.next().value)
            .to.have.property("CALL")
            .to.have.property("context")
            .to.have.property("batch")
            .eql(batch);
        });

        it("should update bucket state from response data", () => {
          const responses = [
            { status: 200, body: bucket },
            { status: 200, body: groups },
            { status: 200, body: group },
          ];

          expect(loadRoute.next(responses).value).eql(
            put(
              actions.routeLoadSuccess({
                bucket,
                groups: groups.data,
                collection: null,
                record: null,
                group,
              })
            )
          );
        });
      });

      describe("Bucket + Collection + Record", () => {
        const params = {
          bid: "bucket",
          cid: "collection",
          rid: "record",
        };

        beforeAll(() => {
          batch = () => {};
          setClient({ batch });
          loadRoute = saga.loadRoute(params);
        });

        it("should dispatch the routeLoadRequest action", () => {
          expect(loadRoute.next().value).eql(
            put(actions.routeLoadRequest(params))
          );
        });

        it("should batch fetch resources data", () => {
          expect(loadRoute.next().value)
            .to.have.property("CALL")
            .to.have.property("context")
            .to.have.property("batch")
            .eql(batch);
        });

        it("should update bucket state from response data", () => {
          const responses = [
            { status: 200, body: bucket },
            { status: 200, body: groups },
            { status: 200, body: collection },
            { status: 200, body: record },
          ];

          expect(loadRoute.next(responses).value).eql(
            put(
              actions.routeLoadSuccess({
                bucket,
                groups: groups.data,
                collection,
                record,
                group: null,
              })
            )
          );
        });
      });
    });

    describe("Unauthorized bucket access", () => {
      let batch, loadRoute;

      const params = {
        bid: "bucket",
      };

      beforeAll(() => {
        batch = () => {};
        setClient({ batch });
        loadRoute = saga.loadRoute(params);
      });

      it("should dispatch the routeLoadRequest action", () => {
        expect(loadRoute.next().value).eql(
          put(actions.routeLoadRequest(params))
        );
      });

      it("should batch fetch resources data", () => {
        expect(loadRoute.next().value)
          .to.have.property("CALL")
          .to.have.property("context")
          .to.have.property("batch")
          .eql(batch);
      });

      it("should update bucket state from response data", () => {
        const responses = [
          { status: 403, body: {} },
          { status: 403, body: {} },
        ];
        expect(loadRoute.next(responses).value).eql(
          put(
            actions.routeLoadSuccess({
              bucket: {
                data: { id: "bucket" },
                permissions: { read: [], write: [] },
              },
              groups: [],
              collection: null,
              group: null,
              record: null,
            })
          )
        );
      });
    });

    describe("Bucket not found", () => {
      let batch, loadRoute;

      const params = {
        bid: "bucket",
      };

      beforeAll(() => {
        batch = () => {};
        setClient({ batch });
        loadRoute = saga.loadRoute(params);
      });

      it("should dispatch the routeLoadRequest action", () => {
        expect(loadRoute.next().value).eql(
          put(actions.routeLoadRequest(params))
        );
      });

      it("should batch fetch resources data", () => {
        expect(loadRoute.next().value)
          .to.have.property("CALL")
          .to.have.property("context")
          .to.have.property("batch")
          .eql(batch);
      });

      it("should dispatch the failure action", () => {
        const responses = [
          { status: 404, body: {} },
          { status: 404, body: {} },
        ];
        expect(loadRoute.next(responses).value).eql(
          put(actions.routeLoadFailure())
        );
      });

      it("should dispatch a notification", () => {
        const mocked = mockNotifyError(sandbox);
        loadRoute.next();
        sinon.assert.calledWith(mocked, "Couldn't retrieve route resources.");
      });
    });
  });

  describe("routeUpdated()", () => {
    describe("Not authenticated", () => {
      let routeUpdated;

      beforeAll(() => {
        const getState = () => ({ session: { authenticated: false } });
        const action = actions.routeUpdated({}, { pathname: "/blah" });
        routeUpdated = saga.routeUpdated(getState, action);
      });

      it("should clear notification", () => {
        expect(routeUpdated.next().value).eql(
          put(notificationActions.clearNotifications())
        );
      });

      it("should store the post-auth redirect URL", () => {
        expect(routeUpdated.next().value).eql(
          put(sessionActions.storeRedirectURL("/blah"))
        );
      });

      it("should redirect to the homepage", () => {
        expect(routeUpdated.next().value).eql(
          put(actions.redirectTo("home", {}))
        );
      });

      it("should dispatch a notification", () => {
        expect(routeUpdated.next().value).eql(
          put(
            notificationActions.notifyInfo("Authentication required.", {
              persistent: true,
            })
          )
        );
      });

      it("should wait for the SESSION_AUTHENTICATED event", () => {
        expect(routeUpdated.next().value).eql(take(SESSION_AUTHENTICATED));
      });

      it("should clear the notification", () => {
        expect(routeUpdated.next().value).eql(
          put(notificationActions.clearNotifications({ force: true }))
        );
      });

      it("should redirect the user to the initially requested URL", () => {
        expect(routeUpdated.next().value).eql(put(updatePath("/blah")));
      });

      it("should remove previously stored redirect URL", () => {
        expect(routeUpdated.next().value).eql(
          put(sessionActions.storeRedirectURL(null))
        );
      });
    });

    describe("Pending authentication", () => {
      let routeUpdated;

      beforeAll(() => {
        const getState = () => ({ session: { authenticated: false } });
        const action = actions.routeUpdated(
          {
            token: "token",
            payload: btoa(JSON.stringify({ redirectURL: "/blah" })),
          },
          {}
        );
        routeUpdated = saga.routeUpdated(getState, action);
      });

      it("should clear notification", () => {
        expect(routeUpdated.next().value).eql(
          put(notificationActions.clearNotifications())
        );
      });

      it("should wait for the SESSION_AUTHENTICATED event", () => {
        expect(routeUpdated.next().value).eql(take(SESSION_AUTHENTICATED));
      });

      it("should redirect to the initially requested URL", () => {
        expect(routeUpdated.next().value).eql(put(updatePath("/blah")));
      });
    });

    describe("Authenticated", () => {
      let routeUpdated;
      const params = { bid: "bucket", cid: "collection", rid: "record" };

      beforeAll(() => {
        const getState = () => ({ session: { authenticated: true } });
        const action = actions.routeUpdated(params, { pathname: "/" });
        routeUpdated = saga.routeUpdated(getState, action);
      });

      it("should clear notification", () => {
        expect(routeUpdated.next().value).eql(
          put(notificationActions.clearNotifications())
        );
      });

      it("should load route resources", () => {
        expect(routeUpdated.next().value).eql(call(saga.loadRoute, params));
      });

      it("should scroll window to top", () => {
        expect(routeUpdated.next().value).eql(call(scrollToTop));
      });
    });
  });
});
