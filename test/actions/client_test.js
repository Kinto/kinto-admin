import { expect } from "chai";
import rewire from "rewire";
import sinon from "sinon";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import KintoClientBase from "kinto-client/lib/base";
import KintoClientBucket from "kinto-client/lib/bucket";

import {
  COLLECTION_CREATED,
  SESSION_SERVER_INFO_LOADED,
  SESSION_BUCKETS_LIST_LOADED,
} from "../../scripts/constants";
const actions = rewire("../../scripts/actions/client");


const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("client actions", () => {
  let sandbox, store;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    store = mockStore({
      session: {
        server: "http://server.test/v1",
        username: "user",
        password: "pass",
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("listBuckets()", () => {
    let kintoListBuckets, serverInfo;

    beforeEach(() => {
      serverInfo = {user: {bucket: 1}};
      sandbox.stub(
        KintoClientBase.prototype, "fetchServerInfo")
          .returns(Promise.resolve(serverInfo));
      sandbox.stub(
        KintoClientBucket.prototype, "getAttributes")
          .returns(Promise.resolve({}));
      kintoListBuckets = sandbox.stub(
        KintoClientBase.prototype, "listBuckets")
          .returns(Promise.resolve({
            data: []
          }));
      return store.dispatch(actions.listBuckets());
    });

    it("should call client createCollection with expected data", () => {
      sinon.assert.called(kintoListBuckets);
    });

    it("should dispatch a SESSION_SERVER_INFO_LOADED action", () => {
      expect(store.getActions()).to.include({
        type: SESSION_SERVER_INFO_LOADED,
        serverInfo
      });
    });

    it("should dispatch a SESSION_SERVER_INFO_LOADED action", () => {
      expect(store.getActions()).to.include({
        type: SESSION_BUCKETS_LIST_LOADED,
        buckets: []
      });
    });
  });

  describe("createCollection()", () => {
    let kintoCreateCollection, data;

    beforeEach(() => {
      kintoCreateCollection = sandbox.stub(
        KintoClientBucket.prototype, "createCollection")
          .returns(Promise.resolve({
            data: {
              id: 1
            }
          }));
      actions.__set__("listBuckets", sandbox.spy());
      data = {name: "mycoll"};

      return store.dispatch(actions.createCollection("bucket", data));
    });

    it("should call client createCollection with expected data", () => {
      sinon.assert.calledWith(kintoCreateCollection, "mycoll");
    });

    it("should dispatch a COLLECTION_CREATED action", () => {
      expect(store.getActions()).to.include({
        type: COLLECTION_CREATED,
        data: {id: 1}
      });
    });

    it("should trigger loading of user's buckets", () => {
      sinon.assert.called(actions.__get__("listBuckets"));
    });
  });
});


