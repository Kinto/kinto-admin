import { expect } from "chai";
import { push as updatePath } from "react-router-redux";
import { put, call } from "redux-saga/effects";

import { saveSession, clearSession } from "../../src/store/localStore";
import { notifyError } from "../../src/actions/notifications";
import * as actions from "../../src/actions/session";
import * as historyActions from "../../src/actions/history";
import * as notificationsActions from "../../src/actions/notifications";
import * as saga from "../../src/sagas/session";
import { getClient, setClient, resetClient } from "../../src/client";


const authData = {
  server: "http://server.test/v1",
  credentials: {
    username: "user",
    password: "pass",
  }
};

describe("session sagas", () => {
  describe("setupSession()", () => {
    let setupSession;

    before(() => {
      resetClient();
      const action = actions.setup(authData);
      setupSession = saga.setupSession(() => {}, action);
      setupSession.next();
    });

    it("should configure the client", () => {
      expect(getClient().remote).eql(authData.server);
    });

    it("should mark the session as busy", () => {
      expect(setupSession.next().value)
        .eql(put(actions.sessionBusy(true)));
    });

    it("should retrieve buckets hierarchy", () => {
      expect(setupSession.next().value)
        .eql(put(actions.listBuckets()));
    });

    it("should mark the session setup as completed", () => {
      expect(setupSession.next().value)
        .eql(put(actions.setupComplete(authData)));
    });

    it("should mark the session as not busy anymore", () => {
      expect(setupSession.next().value)
        .eql(put(actions.sessionBusy(false)));
    });
  });

  describe("listBuckets()", () => {
    describe("Success", () => {
      let client, listBuckets;

      const serverInfo = {
        url: "http://server.test/v1",
        user: {
          bucket: "defaultBucketId"
        },
        capabilities: {
          permissions_endpoint: {}
        }
      };

      const sessionState = {serverInfo};

      before(() => {
        client = setClient({
          batch() {},
          fetchServerInfo() {},
          listBuckets() {},
          listPermissions() {},
        });
        const getState = () => ({session: sessionState});
        const action = actions.listBuckets();
        listBuckets = saga.listBuckets(getState, action);
      });

      it("should fetch server information", () => {
        expect(listBuckets.next().value)
          .eql(call([client, client.fetchServerInfo]));
      });

      it("should mark the user as authenticated", () => {
        expect(listBuckets.next(serverInfo).value)
          .eql(put(actions.setAuthenticated()));
      });

      it("should add server to recent history", () => {
        expect(listBuckets.next().value)
          .eql(put(historyActions.addHistory("http://server.test/v1")));
      });

      it("should dispatch the server information action", () => {
        expect(listBuckets.next().value)
          .eql(put(actions.serverInfoSuccess(serverInfo)));
      });

      it("should fetch the list of buckets", () => {
        expect(listBuckets.next().value)
          .eql(call([client, client.listBuckets]));
      });

      it("should batch fetch bucket collections list", () => {
        const buckets = {data: [{id: "b1"}, {id: "b2"}]};

        expect(listBuckets.next(buckets).value)
          .to.have.property("CALL")
          .to.have.property("fn").eql(client.batch);
      });

      it("should fetch the list of permissions", () => {
        const responses = [
          {body: {data: [{id: "b1c1"}, {id: "b1c2"}]}},
          {body: {data: [{id: "b2c1"}]}},
        ];

        expect(listBuckets.next(responses).value)
          .eql(call([client, client.listPermissions]));
      });

      it("should dispatch list of permissions", () => {
        const permissions = {
          data: [
            {
              bucket_id: "Foo",
              collection_id: "Bar",
            }
          ]
        };
        expect(listBuckets.next(permissions).value)
          .eql(put(actions.permissionsListSuccess(permissions.data)));
      });

      it("should dispatch the list of buckets", () => {
        expect(listBuckets.next().value)
          .eql(put(actions.bucketsSuccess([
            {
              id: "b1",
              collections: [{id: "b1c1"}, {id: "b1c2"}]
            },
            {
              id: "b2",
              collections: [{id: "b2c1"}]
            },
            {
              id: "Foo",
              collections: [{id: "Bar"}]
            }
          ])));
      });

      it("should save the session", () => {
        expect(listBuckets.next().value)
          .eql(call(saveSession, sessionState));
      });

      describe("Forbidden list of buckets", () => {
        before(() => {
          const action = actions.listBuckets();
          const getState = () => ({session: sessionState});
          listBuckets = saga.listBuckets(getState, action);

          listBuckets.next();
          listBuckets.next(serverInfo); // fetch server info
          listBuckets.next();           // mark user authenticated
          listBuckets.next();           // add server to history
          listBuckets.next();           // dispatch server info success
        });

        it("should support 403 errors when fetching list of buckets", () => {
          // listBucket fails with unauthorized error.
          listBuckets.throw(new Error("HTTP 403"));
          // Saga continues without failing.
          expect(listBuckets.next().value)
            .to.have.property("CALL")
            .to.have.property("fn").eql(client.listPermissions);
        });
      });

      describe("Failure", () => {
        it("should dispatch an error notification action", () => {
          const listBuckets = saga.listBuckets();
          listBuckets.next();

          expect(listBuckets.throw("error").value)
            .eql(put(notifyError("Couldn't list buckets.", "error")));
        });
      });
    });

  });

  describe("sessionLogout()", () => {
    let sessionLogout;

    before(() => {
      setClient({fake: true});
      const action = actions.logout();
      sessionLogout = saga.sessionLogout(() => {}, action);
    });

    it("should redirect to the homepage", () => {
      expect(sessionLogout.next().value)
        .eql(put(updatePath("/")));
    });

    it("should notify users they're logged out", () => {
      expect(sessionLogout.next().value)
        .eql(put(notificationsActions.notifySuccess("Logged out.", {persistent: true})));
    });

    it("should clear the saved session", () => {
      expect(sessionLogout.next().value)
        .eql(call(clearSession));
    });

    it("should reset the client", () => {
      expect(() => getClient()).to.throw(Error, /not configured/);
    });
  });
});
