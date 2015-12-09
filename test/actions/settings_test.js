import sinon from "sinon";

import settingsReducer from "../../scripts/reducers/settings";
import * as actions from "../../scripts/actions/settings";
import * as NotificationsActions from "../../scripts/actions/notifications";


describe("settings actions", () => {
  var sandbox, setItem, settings, notifyInfo, notifyError;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    settings = settingsReducer(undefined, {type: null});
    notifyInfo = sandbox.stub(NotificationsActions, "notifyInfo");
    notifyError = sandbox.stub(NotificationsActions, "notifyError");
    setItem = sandbox.stub(localStorage, "setItem");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("saveSettings", () => {
    var dispatch, getState;

    beforeEach(() => {
      dispatch = sandbox.spy();
      getState = () => ({settings});
    });

    describe("Valid settings", () => {
      beforeEach(() => {
        const actionCreator = actions.saveSettings({
          server: "http://ok.server/v1"
        });
        actionCreator(dispatch, getState);
      });

      it("should notify settings have been saved", () => {
        sinon.assert.calledWith(notifyInfo, "Settings saved.");
      });

      it("should store settings", () => {
        sinon.assert.calledWith(setItem, "kwac_settings",
          JSON.stringify({server: "http://ok.server/v1"}));
      });

      it("should dispatch the SETTINGS_SAVED action", () => {
        sinon.assert.calledWith(dispatch, {
          type: actions.SETTINGS_SAVED,
          settings: {server: "http://ok.server/v1"},
        });
      });
    });

    describe("Invalid settings", () => {
      beforeEach(() => {
        const actionCreator = actions.saveSettings({
          server: "http://bad.server/v999"
        });
        actionCreator(dispatch, getState);
      });

      it("should notify with the validation error", () => {
        sinon.assert.calledWithMatch(notifyError, {
          message: "Unsupported protocol version: v999"
        });
      });

      it("should not save invalid settings", () => {
        sinon.assert.notCalled(setItem);
      });
    });
  });
});
