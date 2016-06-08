import { expect } from "chai";
import { push as updatePath } from "react-router-redux";
import { take, fork, put, call } from "redux-saga/effects";

import {
  SESSION_SETUP,
  SESSION_SETUP_COMPLETE,
  SESSION_BUCKETS_REQUEST,
  SESSION_LOGOUT,
} from "../../scripts/constants";
import { notifyError } from "../../scripts/actions/notifications";
import * as actions from "../../scripts/actions/session";
import * as saga from "../../scripts/sagas/session";
import { getClient, setClient, resetClient } from "../../scripts/client";


const session = {
  server: "http://server.test/v1",
  username: "user",
  password: "pass",
};

describe("session sagas", () => {
  describe("setupSession()", () => {
    let setupSession;

    before(() => {
      resetClient();
      setupSession = saga.setupSession(session);
      setupSession.next();
    });

    it("should configure the client", () => {
      expect(getClient().remote).eql(session.server);
    });

    it("should mark the session as busy", () => {
      expect(setupSession.next().value)
        .eql(put(actions.sessionBusy(true)));
    });

    it("should retrieve buckets hierarchy", () => {
      expect(setupSession.next().value)
        .eql(call(saga.listBuckets));
    });

    it("should mark the session setup as completed", () => {
      expect(setupSession.next().value)
        .eql(put(actions.setupComplete(session)));
    });

    it("should mark the session as not busy anymore", () => {
      expect(setupSession.next().value)
        .eql(put(actions.sessionBusy(false)));
    });
  });

  describe("sessionLogout()", () => {
    let sessionLogout;

    before(() => {
      setClient({fake: true});
      sessionLogout = saga.sessionLogout();
    });

    it("should redirect to the homepage", () => {
      expect(sessionLogout.next().value)
        .eql(put(updatePath("/")));
    });

    it("should reset the client", () => {
      expect(() => getClient()).to.Throw(Error, /not configured/);
    });
  });

  describe("listBuckets()", () => {
    describe("Success", () => {
      let client, listBuckets;

      const serverInfo = {
        user: {
          bucket: "defaultBucketId"
        }
      };

      before(() => {
        client = setClient({
          batch() {},
          fetchServerInfo() {},
          listBuckets() {}
        });
        listBuckets = saga.listBuckets();
      });

      it("should fetch server information", () => {
        expect(listBuckets.next().value)
          .eql(call([client, client.fetchServerInfo]));
      });

      it("should dispatch the server information action", () => {
        expect(listBuckets.next(serverInfo).value)
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

      it("should dispatch the list of buckets", () => {
        const responses = [
          {body: {data: [{id: "b1c1"}, {id: "b1c2"}]}},
          {body: {data: [{id: "b2c1"}]}},
        ];

        expect(listBuckets.next(responses).value)
          .eql(put(actions.bucketsSuccess([
            {
              id: "b1",
              collections: [{id: "b1c1"}, {id: "b1c2"}]
            },
            {
              id: "b2",
              collections: [{id: "b2c1"}]
            }
          ])));
      });
    });

    describe("Failure", () => {
      it("should dispatch an error notification action", () => {
        const listBuckets = saga.listBuckets();
        listBuckets.next();

        expect(listBuckets.throw("error").value)
          .eql(put(notifyError("error")));
      });
    });
  });

  describe("handleSessionRedirect()", () => {
    let handleSessionRedirect;

    before(() => {
      handleSessionRedirect = saga.handleSessionRedirect({redirectURL: "/blah"});
    });

    it("should redirect to redirectURL", () => {
      expect(handleSessionRedirect.next().value)
        .eql(put(updatePath("/blah")));
    });

    it("should clear the redirectURL", () => {
      expect(handleSessionRedirect.next().value)
        .eql(put(actions.storeRedirectURL(null)));
    });
  });

  // Watchers

  describe("Watchers", () => {
    describe("watchSessionSetup()", () => {
      it("should watch for the setup action", () => {
        const watchSessionSetup = saga.watchSessionSetup();

        expect(watchSessionSetup.next().value)
          .eql(take(SESSION_SETUP));

        expect(watchSessionSetup.next(actions.setup(session)).value)
          .eql(fork(saga.setupSession, session));
      });
    });

    describe("watchSessionSetupComplete()", () => {
      it("should watch for the setupComplete action", () => {
        const watchSessionSetupComplete = saga.watchSessionSetupComplete();

        expect(watchSessionSetupComplete.next().value)
          .eql(take(SESSION_SETUP_COMPLETE));

        expect(watchSessionSetupComplete.next({session: {}}).value)
          .eql(fork(saga.handleSessionRedirect, {}));
      });
    });

    describe("watchSessionBuckets()", () => {
      it("should watch for the listBuckets action", () => {
        const watchSessionBuckets = saga.watchSessionBuckets();

        expect(watchSessionBuckets.next().value)
          .eql(take(SESSION_BUCKETS_REQUEST));

        expect(watchSessionBuckets.next(actions.listBuckets()).value)
          .eql(fork(saga.listBuckets));
      });
    });

    describe("watchSessionLogout()", () => {
      it("should watch for the logout action", () => {
        const watchSessionLogout = saga.watchSessionLogout();

        expect(watchSessionLogout.next().value)
          .eql(take(SESSION_LOGOUT));

        expect(watchSessionLogout.next(actions.logout()).value)
          .eql(fork(saga.sessionLogout));
      });
    });
  });
});
