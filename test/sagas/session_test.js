import sinon from "sinon";
import { expect } from "chai";
import { createSandbox, mockNotifyError } from "../test_utils";
import { push as updatePath } from "redux-first-history";
import { put, call } from "redux-saga/effects";

import { saveSession, clearSession } from "../../src/store/localStore";
import * as actions from "../../src/actions/session";
import * as serversActions from "../../src/actions/servers";
import * as notificationsActions from "../../src/actions/notifications";
import * as saga from "../../src/sagas/session";
import * as clientUtils from "../../src/client";
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
  let sandbox;

  beforeAll(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

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

    beforeAll(() => {
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

    beforeAll(() => {
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

      it("should split the auth if it's openID", () => {
        const setupClient = sandbox.spy(clientUtils, "setupClient");
        const authData = {
          server: "http://server.test/v1",
          authType: "openid-google",
          tokenType: "Bearer",
          credentials: { token: "the token" },
        };
        action = actions.getServerInfo(authData);
        getServerInfo = saga.getServerInfo(getState, action);
        getServerInfo.next();
        sinon.assert.calledWithExactly(setupClient, {
          authType: "openid",
          provider: "google",
          tokenType: "Bearer",
          server: "http://server.test/v1",
          credentials: { token: "the token" },
        });
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
        const mocked = mockNotifyError(sandbox);
        getServerInfo.next();
        sinon.assert.calledWith(
          mocked,
          "Could not reach server http://server.test/v1"
        );
      });
    });

    describe("Race conditions", () => {
      let action1, action2, getServerInfo1, getServerInfo2;

      beforeEach(() => {
        action1 = actions.getServerInfo({
          ...authData,
          server: "http://server1/v1",
        });
        action2 = actions.getServerInfo({
          ...authData,
          server: "http://server2/v1",
        });
        getServerInfo1 = saga.getServerInfo(getState, action1);
        getServerInfo2 = saga.getServerInfo(getState, action2);
      });

      it("should ignore the success of the oldest", () => {
        getServerInfo1.next();
        getServerInfo2.next();
        // Latest to have started is getServerInfo2, it's taken into account.
        expect(getServerInfo2.next(serverInfo).value).eql(
          put(actions.serverInfoSuccess(serverInfo))
        );
        // getServerInfo1 took longer, it's ignored.
        expect(getServerInfo1.next(serverInfo).value).to.not.exist;
      });

      it("should ignore the error of the oldest", () => {
        getServerInfo1.next();
        getServerInfo2.next();
        // Latest to have started is getServerInfo2, it's taken into account.
        expect(getServerInfo2.next(serverInfo).value).eql(
          put(actions.serverInfoSuccess(serverInfo))
        );
        // getServerInfo1 took longer, it's ignored.
        expect(getServerInfo1.throw().value).to.not.exist;
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

    beforeAll(() => {
      resetClient();
      getState = () => ({
        session: sessionState,
      });
      action = actions.setupSession(authData);
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
          put(serversActions.addServer("http://server.test/v1", "basicauth"))
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

      it("should notify the success", () => {
        expect(setupSession.next().value).eql(
          put(
            notificationsActions.notifySuccess("Authenticated.", {
              details: ["Basic Auth"],
            })
          )
        );
      });

      it("should correctly authenticate the user when using openID", () => {
        const authData = {
          server: "http://server.test/v1",
          authType: "openid-google",
          credentials: { token: "the token" },
        };
        const serverInfo = {
          ...serverInfo,
          user: { id: "google:token" },
        };

        const getStateOpenID = () => ({
          session: {
            serverInfo,
          },
        });
        const action = actions.setupSession(authData);
        const setupSession = saga.setupSession(getStateOpenID, action);
        setupSession.next();

        expect(setupSession.next(serverInfo).value).eql(
          put(actions.setAuthenticated())
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
        jest.spyOn(console, "error").mockImplementation(() => {});
        setupSession = saga.setupSession(getState, action);
        setupSession.next(); // call getServerInfo.
        expect(setupSession.next().value).eql(
          put(
            notificationsActions.notifyError("Authentication failed.", {
              message: "Could not authenticate with Basic Auth",
            })
          )
        );
        expect(setupSession.next().value).eql(
          put(actions.authenticationFailed())
        );
      });

      it("should check the user ID prefix for basicauth", () => {
        const authData = {
          server: "http://server.test/v1",
          authType: "accounts",
          credentials: { username: "alice", password: "secret" },
        };

        getState = () => ({
          session: {
            serverInfo: {
              ...serverInfo,
              user: { id: "basicauth:the-most-confusing-auth-ever" },
            },
          },
        });
        const action = actions.setupSession(authData);
        const setupSession = saga.setupSession(getState, action);
        setupSession.next(); // call getServerInfo.
        const mocked = mockNotifyError(sandbox);
        setupSession.next();
        sinon.assert.calledWith(mocked, "Authentication failed.", {
          message: "Could not authenticate with Kinto Account Auth",
        });
      });
    });
  });

  describe("listBuckets()", () => {
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

    beforeAll(() => {
      client = setClient({
        batch() {},
        fetchServerInfo() {},
        listBuckets() {},
        listPermissions() {},
      });
      const getState = () => ({
        session: sessionState,
      });
      const action = actions.listBuckets();
      listBuckets = saga.listBuckets(getState, action);
    });

    describe("Success", () => {
      it("should fetch the list of buckets", () => {
        expect(listBuckets.next().value).eql(
          call([client, client.listBuckets])
        );
      });

      it("should batch fetch bucket collections list", () => {
        const buckets = { data: [{ id: "b1" }, { id: "b2" }] };

        expect(listBuckets.next(buckets).value)
          .to.have.property("payload")
          .to.have.property("fn")
          .eql(client.batch);
      });

      it("should fetch the list of permissions", () => {
        const responses = [
          { body: { data: [{ id: "b1c1" }, { id: "b1c2" }] } },
          { body: { data: [{ id: "b2c1" }] } },
        ];

        expect(listBuckets.next(responses).value).eql(
          call([client, client.listPermissions], {
            pages: Infinity,
            filters: { exclude_resource_name: "record" },
          })
        );
      });

      it("should dispatch list of permissions", () => {
        const permissions = {
          data: [
            {
              bucket_id: "Foo",
              collection_id: "Bar",
              resource_name: "bucket",
              permissions: ["read"],
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
                canCreateCollection: true,
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
                canCreateCollection: true,
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
                permissions: ["read"],
                readonly: true,
                canCreateCollection: false,
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
          });
          listBuckets = saga.listBuckets(getState, action);

          listBuckets.next();
        });

        it("should support 403 errors when fetching list of buckets", () => {
          // listBucket fails with unauthorized error.
          listBuckets.throw(new Error("HTTP 403"));
          // Saga continues without failing.
          expect(listBuckets.next().value)
            .to.have.property("payload")
            .to.have.property("fn")
            .eql(client.listPermissions);
        });

        it("should support 401 errors when fetching list of buckets", () => {
          // listBucket fails with unauthorized error.
          listBuckets.throw(new Error("HTTP 401"));
          // Saga continues without failing.
          expect(listBuckets.next().value)
            .to.have.property("payload")
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
        });

        const listBuckets = saga.listBuckets(getState, action);
        listBuckets.next();
        const mocked = mockNotifyError(sandbox);
        listBuckets.throw("error");
        sinon.assert.calledWith(mocked, "Couldn't list buckets.", "error");
      });
    });
  });

  describe("sessionLogout()", () => {
    let sessionLogout;

    beforeAll(() => {
      setClient({ fake: true });
      const action = actions.logout();
      sessionLogout = saga.sessionLogout(
        () => ({ router: { location: { pathname: "/not/home" } } }),
        action
      );
    });

    it("should redirect to the homepage", () => {
      expect(sessionLogout.next().value).eql(put(updatePath("/")));
    });

    it("should notify users they're logged out", () => {
      expect(sessionLogout.next().value).eql(
        put(notificationsActions.notifySuccess("Logged out."))
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
    { id: "b1", permissions: [], collections: [], readonly: undefined },
    { id: "b2", permissions: [], collections: [], readonly: undefined },
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
    { resource_name: "root", permissions: ["bucket:create"] },
    bucketPerm("b1", ["read"]),
    bucketPerm("b2", ["read"]),
    bucketPerm("b4", ["write"]),
    collectionPerm("b1", "b1c1", ["read", "write"]),
    collectionPerm("b2", "b2c1", ["read"]),
    collectionPerm("b3", "b3c1", ["read", "write"]),
    bucketPerm("foo", ["read"]),
    collectionPerm("foo", "foo", ["read"]),
  ];

  const tree = saga.expandBucketsCollections(buckets, permissions, 2);

  it("should denote a bucket as writable", () => {
    expect(tree.find(b => b.id === "b4").readonly).to.be.false;
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
    expect(tree.find(b => b.id === "b3").readonly).to.be.true;
  });

  it("should distinguish resource ids", () => {
    const fooBucket = tree.find(b => b.id === "foo");
    expect(fooBucket).to.exist;
    expect(fooBucket.collections.find(c => c.id === "foo")).to.exist;
  });
});
