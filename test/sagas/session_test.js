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
import { DEFAULT_SERVERINFO } from "../../src/reducers/session";

const authData = {
  server: "http://server.test/v1",
  authType: "basicauth",
  credentials: {
    username: "user",
    password: "pass",
  },
};

describe("session sagas", () => {
  describe("serverChange()", () => {
    let serverChange, getState;

    const serverInfo = {
      ...DEFAULT_SERVERINFO,
      url: "http://server.test/v1",
      user: {
        id: "basicauth:abcd",
      },
    };

    const sessionState = { serverInfo };

    before(() => {
      getState = () => ({
        session: sessionState,
      });
      serverChange = saga.serverChange(getState);
    });

    it("should reset the server info in the state", () => {
      expect(serverChange.next().value).eql(
        put(actions.serverInfoSuccess(DEFAULT_SERVERINFO))
      );
    });
    it("should clear the notifications", () => {
      expect(serverChange.next().value).eql(
        put(notificationsActions.clearNotifications({ force: true }))
      );
    });
  });

  describe("getServerInfo()", () => {
    let getServerInfo, getState, action, client;

    const serverInfo = {
      ...DEFAULT_SERVERINFO,
      url: "http://server.test/v1",
      user: {
        id: "basicauth:abcd",
      },
    };

    const sessionState = { serverInfo };

    before(() => {
      resetClient();
      getState = () => ({
        session: sessionState,
      });
      action = actions.getServerInfo(authData);
      getServerInfo = saga.getServerInfo(getState, action);
    });

    describe("Success", () => {
      it("should call client.fetchServerInfo", () => {
        const fetchServerInfoCall = getServerInfo.next().value;
        client = getClient();
        expect(fetchServerInfoCall).eql(call([client, client.fetchServerInfo]));
      });

      it("should have configured the client", () => {
        expect(getClient().remote).eql(authData.server);
      });

      it("should send a serverInfoSuccess", () => {
        expect(getServerInfo.next(serverInfo).value).eql(
          put(actions.serverInfoSuccess(serverInfo))
        );
      });

      it("should clear the notifications", () => {
        expect(getServerInfo.next().value).eql(
          put(notificationsActions.clearNotifications({ force: true }))
        );
      });
    });

    describe("Failure", () => {
      it("should reset the server info", () => {
        // Make sure that we don't keep previously stored capabilities when
        // the new server fails.
        getServerInfo = saga.getServerInfo(getState, action);
        getServerInfo.next();
        expect(getServerInfo.throw().value).eql(
          put(actions.serverInfoSuccess(DEFAULT_SERVERINFO))
        );
      });

      it("should notify the error", () => {
        expect(getServerInfo.next().value).eql(
          put(notifyError("Could not reach server"))
        );
      });
    });
  });

  describe("setupSession()", () => {
    let setupSession, getState, action;

    const serverInfo = {
      ...DEFAULT_SERVERINFO,
      url: "http://server.test/v1",
      user: {
        id: "basicauth:abcd",
      },
    };

    const sessionState = { serverInfo };

    before(() => {
      resetClient();
      getState = () => ({
        session: sessionState,
      });
      action = actions.setup(authData);
      setupSession = saga.setupSession(getState, action);
    });

    describe("Success", () => {
      it("should call getServerInfo", () => {
        expect(setupSession.next().value).eql(
          call(saga.getServerInfo, getState, actions.getServerInfo(authData))
        );
      });

      it("should mark the user as authenticated", () => {
        expect(setupSession.next(serverInfo).value).eql(
          put(actions.setAuthenticated())
        );
      });

      it("should add server to recent history", () => {
        expect(setupSession.next().value).eql(
          put(historyActions.addHistory("http://server.test/v1"))
        );
      });

      it("should retrieve buckets hierarchy", () => {
        expect(setupSession.next().value).eql(put(actions.listBuckets()));
      });

      it("should mark the session setup as completed", () => {
        expect(setupSession.next().value).eql(
          put(actions.setupComplete(authData))
        );
      });
    });

    describe("Failure", () => {
      it("should notify authentication error", () => {
        getState = () => ({
          session: {
            serverInfo: {
              ...serverInfo,
              user: {},
            },
          },
        });
        setupSession = saga.setupSession(getState, action);
        setupSession.next(); // call getServerInfo.
        expect(setupSession.next().value).eql(
          put(notifyError("Authentication failed."))
        );
      });
    });
  });

  describe("listBuckets()", () => {
    const settingsState = { sidebarMaxListedCollections: 2 };

    describe("Success", () => {
      let client, listBuckets;

      const serverInfo = {
        url: "http://server.test/v1",
        user: {
          bucket: "defaultBucketId",
        },
        capabilities: {
          permissions_endpoint: {},
        },
      };

      const sessionState = { serverInfo };

      before(() => {
        client = setClient({
          batch() {},
          fetchServerInfo() {},
          listBuckets() {},
          listPermissions() {},
        });
        const getState = () => ({
          session: sessionState,
          settings: settingsState,
        });
        const action = actions.listBuckets();
        listBuckets = saga.listBuckets(getState, action);
      });

      it("should fetch the list of buckets", () => {
        expect(listBuckets.next().value).eql(
          call([client, client.listBuckets])
        );
      });

      it("should batch fetch bucket collections list", () => {
        const buckets = { data: [{ id: "b1" }, { id: "b2" }] };

        expect(listBuckets.next(buckets).value)
          .to.have.property("CALL")
          .to.have.property("fn")
          .eql(client.batch);
      });

      it("should fetch the list of permissions", () => {
        const responses = [
          { body: { data: [{ id: "b1c1" }, { id: "b1c2" }] } },
          { body: { data: [{ id: "b2c1" }] } },
        ];

        expect(listBuckets.next(responses).value).eql(
          call([client, client.listPermissions], { pages: Infinity })
        );
      });

      it("should dispatch list of permissions", () => {
        const permissions = {
          data: [
            {
              bucket_id: "Foo",
              collection_id: "Bar",
            },
          ],
        };
        expect(listBuckets.next(permissions).value).eql(
          put(actions.permissionsListSuccess(permissions.data))
        );
      });

      it("should dispatch the list of buckets", () => {
        expect(listBuckets.next().value).eql(
          put(
            actions.bucketsSuccess([
              {
                id: "b1",
                collections: [
                  {
                    id: "b1c1",
                    permissions: [],
                    readonly: true,
                  },
                  {
                    id: "b1c2",
                    permissions: [],
                    readonly: true,
                  },
                ],
                permissions: [],
                readonly: true,
              },
              {
                id: "b2",
                collections: [
                  {
                    id: "b2c1",
                    permissions: [],
                    readonly: true,
                  },
                ],
                permissions: [],
                readonly: true,
              },
              {
                id: "Foo",
                collections: [
                  {
                    id: "Bar",
                    permissions: [],
                    readonly: true,
                  },
                ],
                permissions: [],
                readonly: true,
              },
            ])
          )
        );
      });

      it("should save the session", () => {
        expect(listBuckets.next().value).eql(call(saveSession, sessionState));
      });

      describe("Forbidden list of buckets", () => {
        beforeEach(() => {
          const action = actions.listBuckets();
          const getState = () => ({
            session: sessionState,
            settings: settingsState,
          });
          listBuckets = saga.listBuckets(getState, action);

          listBuckets.next();
        });

        it("should support 403 errors when fetching list of buckets", () => {
          // listBucket fails with unauthorized error.
          listBuckets.throw(new Error("HTTP 403"));
          // Saga continues without failing.
          expect(listBuckets.next().value)
            .to.have.property("CALL")
            .to.have.property("fn")
            .eql(client.listPermissions);
        });

        it("should support 401 errors when fetching list of buckets", () => {
          // listBucket fails with unauthorized error.
          listBuckets.throw(new Error("HTTP 401"));
          // Saga continues without failing.
          expect(listBuckets.next().value)
            .to.have.property("CALL")
            .to.have.property("fn")
            .eql(client.listPermissions);
        });
      });
    });

    describe("Failure", () => {
      it("should dispatch an error notification action", () => {
        const action = actions.listBuckets();
        const getState = () => ({
          session: {
            serverInfo: { capabilities: [] },
          },
          settings: settingsState,
        });

        const listBuckets = saga.listBuckets(getState, action);
        listBuckets.next();
        expect(listBuckets.throw("error").value).eql(
          put(notifyError("Couldn't list buckets.", "error"))
        );
      });
    });
  });

  describe("sessionLogout()", () => {
    let sessionLogout;

    before(() => {
      setClient({ fake: true });
      const action = actions.logout();
      sessionLogout = saga.sessionLogout(() => {}, action);
    });

    it("should redirect to the homepage", () => {
      expect(sessionLogout.next().value).eql(put(updatePath("/")));
    });

    it("should notify users they're logged out", () => {
      expect(sessionLogout.next().value).eql(
        put(
          notificationsActions.notifySuccess("Logged out.", {
            persistent: true,
          })
        )
      );
    });

    it("should clear the saved session", () => {
      expect(sessionLogout.next().value).eql(call(clearSession));
    });

    it("should reset the client", () => {
      expect(() => getClient()).to.throw(Error, /not configured/);
    });
  });
});

describe("expandBucketsCollections()", () => {
  const buckets = [
    { id: "b1", permissions: [], collections: [], readonly: true },
    { id: "b2", permissions: [], collections: [], readonly: true },
  ];

  function bucketPerm(bucket_id, permissions) {
    return { resource_name: "bucket", bucket_id, permissions };
  }

  function collectionPerm(bucket_id, collection_id, permissions) {
    return {
      resource_name: "collection",
      bucket_id,
      collection_id,
      permissions,
    };
  }

  const permissions = [
    bucketPerm("b1", ["read"]),
    bucketPerm("b2", ["read"]),
    collectionPerm("b1", "b1c1", ["read", "write"]),
    collectionPerm("b2", "b2c1", ["read"]),
    collectionPerm("b3", "b3c1", ["read", "write"]),
    bucketPerm("foo", ["read"]),
    collectionPerm("foo", "foo", ["read"]),
  ];

  const tree = saga.expandBucketsCollections(buckets, permissions, 2);

  it("should denote a bucket as writable", () => {
    expect(tree.find(b => b.id === "b1").readonly).to.be.false;
  });

  it("should denote a bucket as readonly", () => {
    expect(tree.find(b => b.id === "b2").readonly).to.be.true;
  });

  it("should denote a collection as writable", () => {
    const b1c1 = tree
      .find(b => b.id === "b1")
      .collections.find(c => c.id === "b1c1");
    expect(b1c1.readonly).to.be.false;
  });

  it("should denote a collection as readonly", () => {
    const b2c1 = tree
      .find(b => b.id === "b2")
      .collections.find(c => c.id === "b2c1");
    expect(b2c1.readonly).to.be.true;
  });

  it("should infer an implicit bucket", () => {
    expect(tree.find(b => b.id === "b3").readonly).to.be.false;
  });

  it("should distinguish resource ids", () => {
    const fooBucket = tree.find(b => b.id === "foo");
    expect(fooBucket).to.exist;
    expect(fooBucket.collections.find(c => c.id === "foo")).to.exist;
  });
});
