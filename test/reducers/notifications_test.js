import { expect } from "chai";
import { UPDATE_PATH } from "redux-simple-router";

import notifications from "../../scripts/reducers/notifications";
import {
  NOTIFICATION_ADDED,
  NOTIFICATION_REMOVED,
  NOTIFICATION_CLEAR,
} from "../../scripts/constants";


describe("notifications reducer", () => {
  it("NOTIFICATION_ADDED", () => {
    expect(notifications([1, 2], {
      type: NOTIFICATION_ADDED,
      notification: 3,
    })).eql([1, 2, 3]);
  });

  it("NOTIFICATION_REMOVED", () => {
    expect(notifications([1, 2, 3], {
      type: NOTIFICATION_REMOVED,
      index: 1,
    })).eql([1, 3]);
  });

  it("NOTIFICATION_CLEAR", () => {
    expect(notifications([1, 2, 3], {
      type: NOTIFICATION_CLEAR,
    })).eql([]);
  });

  it("UPDATE_PATH", () => {
    expect(notifications([1, 2, 3], {
      type: UPDATE_PATH,
    })).eql([]);
  });
});
