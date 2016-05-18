import { expect } from "chai";
import rewire from "rewire";
import sinon from "sinon";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { UPDATE_PATH } from "redux-simple-router";

import sessionReducer from "../../scripts/reducers/session";
const actions = rewire("../../scripts/actions/session");

import {
  SESSION_SETUP_COMPLETE,
  SESSION_LOGOUT,
} from "../../scripts/constants";


const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("session actions", () => {
  let sandbox, store;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    store = mockStore({
      session: sessionReducer(undefined, {type: null})
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("setup()", () => {
    const sessionData = {
      server: "http://test.server/v1",
      username: "user",
      password: "pass",
    };

    beforeEach(() => {
      actions.__set__("ClientActions", {listBuckets: sandbox.spy()});
      return store.dispatch(actions.setup(sessionData));
    });

    it("should dispatch a SESSION_SETUP_COMPLETE action", () => {
      expect(store.getActions()).to.include({
        type: SESSION_SETUP_COMPLETE,
        session: sessionData
      });
    });

    it("should trigger loading the list of user buckets", () => {
      sinon.assert.calledOnce(actions.__get__("ClientActions").listBuckets);
    });
  });

  describe("logout()", () => {
    beforeEach(() => {
      actions.__set__("ClientActions", {resetClient: sandbox.spy()});
      return store.dispatch(actions.logout());
    });

    it("should dispatch a SESSION_SETUP_COMPLETE action", () => {
      expect(store.getActions()).to.include({
        type: SESSION_LOGOUT,
      });
    });

    it("should dispatch a UPDATE_PATH action ", () => {
      expect(store.getActions()).to.include({
        type: UPDATE_PATH,
        path: "/",
        avoidRouterUpdate: false,
      });
    });

    it("should trigger resetting the kinto client", () => {
      sinon.assert.calledOnce(actions.__get__("ClientActions").resetClient);
    });
  });
});
