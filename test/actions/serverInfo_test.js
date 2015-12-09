import sinon from "sinon";

import serverInfoReducer from "../../scripts/reducers/serverInfo";
import * as actions from "../../scripts/actions/serverInfo";
import * as NotificationsActions from "../../scripts/actions/notifications";


describe("serverInfo actions", () => {
  var sandbox, serverInfo, notifyError;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    serverInfo = serverInfoReducer(undefined, {type: null});
    notifyError = sandbox.stub(NotificationsActions, "notifyError");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("loadServerInfo", () => {
    var dispatch, getState;

    beforeEach(() => {
      dispatch = sandbox.spy();
      getState = () => ({serverInfo});
    });

    it("should fix server url if no trailing slash is provided", () => {
      const fetch = sandbox.stub(global, "fetch")
        .returns(Promise.resolve({
          json() {return {};}
        }));

      actions.loadServerInfo("http://foo/v1")(dispatch, getState);

      sinon.assert.calledWith(fetch, "http://foo/v1/");
    });

    it("should reset server info data", () => {
      sandbox.stub(global, "fetch").returns(Promise.resolve({
        json() {return {a: 1};}
      }));

      actions.loadServerInfo("http://foo/v1")(dispatch, getState);

      sinon.assert.calledWith(dispatch, {
        type: actions.SERVERINFO_RESET,
      });
    });

    it("should dispatch SERVERINFO_LOADED when data is retrieved", (done) => {
      sandbox.stub(global, "fetch").returns(Promise.resolve({
        json() {return {a: 1};}
      }));

      actions.loadServerInfo("http://foo/v1")(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWith(dispatch, {
          type: actions.SERVERINFO_LOADED,
          serverInfo: {a: 1}
        });
        done();
      });
    });

    it("should notify if fetching server information fails", (done) => {
      sandbox.stub(global, "fetch").returns(Promise.reject(new Error("err")));

      actions.loadServerInfo("http://foo/v1")(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWithMatch(notifyError, {
          message: "err"
        });
        done();
      });
    });
  });
});
