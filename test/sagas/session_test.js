import { expect } from "chai";
import { push as updatePath } from "react-router-redux";
import { put, call } from "redux-saga/effects";

import { notifyError } from "../../scripts/actions/notifications";
import * as actions from "../../scripts/actions/session";
import * as historyActions from "../../scripts/actions/history";
import * as saga from "../../scripts/sagas/session";
import {
  getClient,
  setClient,
  resetClient,
  requestPermissions
} from "../../scripts/client";


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
      const action = actions.setup(session);
      setupSession = saga.setupSession(() => {}, action);
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
        .eql(put(actions.listBuckets()));
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

  describe("listBuckets()", () => {
    describe("Success", () => {
      let client, listBuckets;

      const serverInfo = {
        user: {
          bucket: "defaultBucketId"
        },
        capabilities: {
          permissions_endpoint: {}
        }
      };

      before(() => {
        client = setClient({
          batch() {},
          fetchServerInfo() {},
          listBuckets() {}
        });
        const getState = () => ({
          session: {
            server: "http://server.test/v1"
          }
        });
        const action = actions.listBuckets();
        listBuckets = saga.listBuckets(getState, action);
      });

      it("should fetch server information", () => {
        expect(listBuckets.next().value)
          .eql(call([client, client.fetchServerInfo]));
      });

      it("should add server to recent history", () => {
        expect(listBuckets.next(serverInfo).value)
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
          .eql(call(requestPermissions));
      });

      it("should dispatch the list of buckets", () => {
        const permissions = {
          data: [
            {
              bucket_id: "Foo",
              collection_id: "Bar",
            }
          ]
        };

        expect(listBuckets.next(permissions).value)
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

  describe("completeSessionSetup()", () => {
    let completeSessionSetup;

    before(() => {
      const action = actions.setupComplete({server: "server", redirectURL: "/blah"});
      completeSessionSetup = saga.completeSessionSetup(() =>  {}, action);
    });

    it("should redirect to redirectURL", () => {
      expect(completeSessionSetup.next().value)
        .eql(put(updatePath("/blah")));
    });

    it("should clear the redirectURL", () => {
      expect(completeSessionSetup.next().value)
        .eql(put(actions.storeRedirectURL(null)));
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

    it("should reset the client", () => {
      expect(() => getClient()).to.throw(Error, /not configured/);
    });
  });
});
