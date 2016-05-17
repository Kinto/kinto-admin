import { expect } from "chai";
import rewire from "rewire";
import sinon from "sinon";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import KintoClientBucket from "kinto-client/lib/bucket";

import { COLLECTION_CREATED } from "../../scripts/constants";
const actions = rewire("../../scripts/actions/client");


const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("client actions", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("createCollection()", () => {
    let kintoCreateCollection, store, data;

    beforeEach(() => {
      kintoCreateCollection = sandbox.stub(
        KintoClientBucket.prototype, "createCollection")
          .returns(Promise.resolve({
            data: {
              id: 1
            }
          }));
      actions.__set__("listBuckets", sandbox.spy());
      store = mockStore({
        session: {
          server: "http://server.test/v1",
          username: "user",
          password: "pass",
        }
      });
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


