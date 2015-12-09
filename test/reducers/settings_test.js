import { expect } from "chai";
import settings, {defaultSettings} from "../../scripts/reducers/settings";
import * as actions from "../../scripts/actions/settings";

describe("settings reducer", () => {
  beforeEach(() => {
    localStorage.removeItem("kwac_settings");
  });

  it("should initialize state with default settings", () => {
    expect(settings(undefined, {type: null})).eql(defaultSettings);
  });

  it("should preserve state", () => {
    expect(settings({user: "foo"}, {})).eql({user: "foo"});
  });

  it("should update state when settings are loaded", () => {
    expect(settings({user: "foo"}, {
      type: actions.SETTINGS_SAVED,
      settings: {user: "bar"}
    })).eql({user: "bar"});
  });
});
