import { expect } from "chai";
import rewire from "rewire";
import sinon from "sinon";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import KintoClientBase from "kinto-client/lib/base";
import KintoClientBucket from "kinto-client/lib/bucket";
import KintoClientCollection from "kinto-client/lib/collection";

import { UPDATE_PATH } from "redux-simple-router";
import {
  COLLECTION_CREATED,
  COLLECTION_DELETED,
  SESSION_SERVER_INFO_LOADED,
  SESSION_BUCKETS_LIST_LOADED,
  COLLECTION_PROPERTIES_LOADED,
  COLLECTION_RECORDS_LOADED,
  COLLECTION_RECORD_CREATED,
  RECORD_RESET,
} from "../../scripts/constants";

const actions = rewire("../../scripts/actions/client");


const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const sampleCollectionMeta = {
  schema: {type: "object"},
  uiSchema: {"foo": "bar"},
  displayFields: ["foo"],
};

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

    it("should dispatch a SESSION_BUCKETS_LIST_LOADED action", () => {
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
            data: {id: 1}
          }));
      actions.__set__("listBuckets", sandbox.spy());
      data = {
        name: "mycoll",
        ...sampleCollectionMeta
      };

      return store.dispatch(actions.createCollection("bucket", data));
    });

    it("should call client createCollection with expected data", () => {
      sinon.assert.calledWith(kintoCreateCollection, "mycoll", {
        data: {
          schema: {type: "object"},
          uiSchema: {"foo": "bar"},
          displayFields: ["foo"],
        }
      });
    });

    it("should dispatch a COLLECTION_CREATED action", () => {
      expect(store.getActions()).to.include({
        type: COLLECTION_CREATED,
        data: {id: 1}
      });
    });

    it("should trigger reloading of user's buckets", () => {
      sinon.assert.calledOnce(actions.__get__("listBuckets"));
    });
  });

  describe("deleteCollection()", () => {
    let kintoDeleteCollection;

    beforeEach(() => {
      kintoDeleteCollection = sandbox.stub(
        KintoClientBucket.prototype, "deleteCollection")
          .returns(Promise.resolve({
            data: {id: 1}
          }));
      actions.__set__("listBuckets", sandbox.spy());

      return store.dispatch(actions.deleteCollection("bucket", "mycoll"));
    });

    it("should call client deleteCollection with expected arg", () => {
      sinon.assert.calledWith(kintoDeleteCollection, "mycoll");
    });

    it("should dispatch a COLLECTION_DELETED action", () => {
      expect(store.getActions()).to.include({
        type: COLLECTION_DELETED,
        data: {id: 1}
      });
    });

    it("should dispatch a UPDATE_PATH action", () => {
      expect(store.getActions()).to.include({
        type: UPDATE_PATH,
        path: "",
        avoidRouterUpdate: false,
      });
    });

    it("should trigger reloading of user's buckets", () => {
      sinon.assert.calledOnce(actions.__get__("listBuckets"));
    });
  });

  describe("loadCollectionProperties()", () => {
    let kintoCollectionGetAttributes;

    const data = {
      id: 1,
      ...sampleCollectionMeta
    };

    beforeEach(() => {
      kintoCollectionGetAttributes = sandbox.stub(
        KintoClientCollection.prototype, "getAttributes")
          .returns(Promise.resolve({data}));

      return store.dispatch(
        actions.loadCollectionProperties("bucket", "mycoll"));
    });

    it("should call client loadCollectionProperties with expected arg", () => {
      sinon.assert.calledOnce(kintoCollectionGetAttributes);
    });

    it("should dispatch a COLLECTION_PROPERTIES_LOADED action", () => {
      expect(store.getActions()).to.include({
        type: COLLECTION_PROPERTIES_LOADED,
        properties: {...data, bucket: "bucket", label: "bucket/1"}
      });
    });
  });

  describe("updateCollectionProperties()", () => {
    let kintoCollectionSetMetadata;

    beforeEach(() => {
      kintoCollectionSetMetadata = sandbox.stub(
        KintoClientCollection.prototype, "setMetadata")
          .returns(Promise.resolve({
            data: {
              id: 1,
              ... sampleCollectionMeta
            }
          }));

      return store.dispatch(
        actions.updateCollectionProperties(
          "bucket", "mycoll", sampleCollectionMeta));
    });

    it("should call client setMetadata with expected meta", () => {
      sinon.assert.calledWith(kintoCollectionSetMetadata, sampleCollectionMeta);
    });

    it("should dispatch a COLLECTION_PROPERTIES_LOADED action", () => {
      expect(store.getActions()).to.include({
        type: COLLECTION_PROPERTIES_LOADED,
        properties: {
          id: 1,
          bucket: "bucket",
          label: "bucket/1",
          ...sampleCollectionMeta,
        }
      });
    });
  });

  describe("listRecords()", () => {
    let kintoCollectionListRecords;

    beforeEach(() => {
      kintoCollectionListRecords = sandbox.stub(
        KintoClientCollection.prototype, "listRecords")
          .returns(Promise.resolve({
            data: [{foo: "bar"}]
          }));

      return store.dispatch(actions.listRecords("bucket", "mycoll"));
    });

    it("should call client listRecords with expected meta", () => {
      sinon.assert.calledOnce(kintoCollectionListRecords);
    });

    it("should dispatch a COLLECTION_RECORDS_LOADED action", () => {
      expect(store.getActions()).to.include({
        type: COLLECTION_RECORDS_LOADED,
        records: [{foo: "bar"}]
      });
    });
  });

  describe("createRecord()", () => {
    let kintoCollectionCreateRecord;

    beforeEach(() => {
      kintoCollectionCreateRecord = sandbox.stub(
        KintoClientCollection.prototype, "createRecord")
          .returns(Promise.resolve({
            data: {
              id: 1,
              foo: "bar"
            },
            permissions: {}
          }));
      actions.__set__("listRecords", sandbox.spy());

      return store.dispatch(
        actions.createRecord("bucket", "mycoll", {foo: "bar"}));
    });

    it("should call client createRecord with expected meta", () => {
      sinon.assert.calledWith(kintoCollectionCreateRecord, {foo: "bar"});
    });

    it("should dispatch a COLLECTION_RECORD_CREATED action", () => {
      expect(store.getActions()).to.include({
        type: COLLECTION_RECORD_CREATED,
        data: {
          id: 1,
          foo: "bar"
        },
      });
    });

    it("should dispatch a UPDATE_PATH action", () => {
      expect(store.getActions()).to.include({
        type: UPDATE_PATH,
        path: "/buckets/bucket/collections/mycoll",
        avoidRouterUpdate: false,
      });
    });

    it("should trigger reloading of collection records", () => {
      sinon.assert.calledOnce(actions.__get__("listRecords"));
    });
  });

  describe("updateRecord()", () => {
    let kintoCollectionUpdateRecord;

    beforeEach(() => {
      kintoCollectionUpdateRecord = sandbox.stub(
        KintoClientCollection.prototype, "updateRecord")
          .returns(Promise.resolve({
            data: {
              id: 1,
              foo: "bar"
            },
            permissions: {}
          }));
      actions.__set__("listRecords", sandbox.spy());

      return store.dispatch(
        actions.updateRecord("bucket", "mycoll", 1, {foo: "bar"}));
    });

    it("should call client updateRecord with expected meta", () => {
      sinon.assert.calledWith(kintoCollectionUpdateRecord, {id: 1, foo: "bar"});
    });

    it("should dispatch a RECORD_RESET action", () => {
      expect(store.getActions()).to.include({type: RECORD_RESET});
    });

    it("should dispatch a UPDATE_PATH action", () => {
      expect(store.getActions()).to.include({
        type: UPDATE_PATH,
        path: "/buckets/bucket/collections/mycoll",
        avoidRouterUpdate: false,
      });
    });

    it("should trigger reloading of collection records", () => {
      sinon.assert.calledOnce(actions.__get__("listRecords"));
    });
  });

  describe("deleteRecord()", () => {
    let kintoCollectionDeleteRecord;

    beforeEach(() => {
      kintoCollectionDeleteRecord = sandbox.stub(
        KintoClientCollection.prototype, "deleteRecord")
          .returns(Promise.resolve({
            data: {
              id: 1,
              foo: "bar"
            },
            permissions: {}
          }));
      actions.__set__("listRecords", sandbox.spy());

      return store.dispatch(actions.deleteRecord("bucket", "mycoll", 1));
    });

    it("should call client deleteRecord with expected meta", () => {
      sinon.assert.calledWith(kintoCollectionDeleteRecord, 1);
    });

    it("should dispatch a UPDATE_PATH action", () => {
      expect(store.getActions()).to.include({
        type: UPDATE_PATH,
        path: "/buckets/bucket/collections/mycoll",
        avoidRouterUpdate: false,
      });
    });

    it("should trigger reloading of collection records", () => {
      sinon.assert.calledOnce(actions.__get__("listRecords"));
    });
  });

  describe("bulkCreateRecords()", () => {
    let kintoCollectionBatch;

    const records = [
      {foo: "bar1"},
      {foo: "bar2"},
    ];

    beforeEach(() => {
      kintoCollectionBatch = sandbox.stub(
        KintoClientCollection.prototype, "batch")
          .returns(Promise.resolve({
            errors: []
          }));
      actions.__set__("listRecords", sandbox.spy());

      return store.dispatch(
        actions.bulkCreateRecords("bucket", "mycoll", records));
    });

    it("should call client batch with expected records", () => {
      sinon.assert.calledWithExactly(kintoCollectionBatch, sinon.match(val => {
        // XXX there's no obvious way to test for that function inner processing
        return typeof val === "function";
      }), {aggregate: true});
    });

    it("should dispatch a UPDATE_PATH action", () => {
      expect(store.getActions()).to.include({
        type: UPDATE_PATH,
        path: "/buckets/bucket/collections/mycoll",
        avoidRouterUpdate: false,
      });
    });

    it("should trigger reloading of collection records", () => {
      sinon.assert.calledOnce(actions.__get__("listRecords"));
    });
  });
});


