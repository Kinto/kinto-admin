import sinon from "sinon";

import * as actions from "../../scripts/actions/collections";
import * as NotificationsActions from "../../scripts/actions/notifications";
import * as SettingsActions from "../../scripts/actions/settings";


describe("collections actions", () => {
  var sandbox, notifyError, settingsLoaded;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    notifyError = sandbox.stub(NotificationsActions, "notifyError");
    settingsLoaded = sandbox.stub(SettingsActions, "settingsLoaded");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("loadCollections()", () => {
    it("should load settings from the config when they're provided", (done) => {
      sandbox.stub(global, "fetch").returns(Promise.resolve({
        json() {
          return {settings: {isSetting: true}};
        }
      }));

      actions.loadCollections()(sandbox.spy());

      setImmediate(() => {
        sinon.assert.calledWithMatch(settingsLoaded, {isSetting: true});
        done();
      });
    });

    it("should retrieve the collections configuration", (done) => {
      sandbox.stub(global, "fetch").returns(Promise.resolve({
        json() {
          return {collections: {a: 1}};
        }
      }));
      const dispatch = sandbox.spy();

      actions.loadCollections()(dispatch);

      setImmediate(() => {
        sinon.assert.calledWithMatch(dispatch, {collections: {a: 1}});
        done();
      });
    });

    it("should notify from fetch errors", done => {
      sandbox.stub(global, "fetch").returns(
        Promise.reject(new Error("boo")));
      const dispatch = sandbox.spy();

      actions.loadCollections()(dispatch);

      setImmediate(() => {
        sinon.assert.calledWithMatch(notifyError, {message: "boo"});
        done();
      });
    });
  });
});
