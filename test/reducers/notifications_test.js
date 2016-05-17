import { expect } from "chai";
import { UPDATE_PATH } from "redux-simple-router";

import notifications from "../../scripts/reducers/notifications";
import {
  NOTIFICATION_ADDED,
  NOTIFICATION_REMOVED,
  NOTIFICATION_CLEAR,
} from "../../scripts/constants";


describe("notifications reducer", () => {
  it("should add a notification", () => {
    expect(notifications([1, 2], {
      type: NOTIFICATION_ADDED,
      notification: 3,
    })).eql([1, 2, 3]);
  });

  it("should remove a notification", () => {
    expect(notifications([1, 2, 3], {
      type: NOTIFICATION_REMOVED,
      index: 1,
    })).eql([1, 3]);
  });

  it("should clear notifications on clear action received", () => {
    expect(notifications([1, 2, 3], {
      type: NOTIFICATION_CLEAR,
    })).eql([]);
  });

  it("should clear notifications on url changed", () => {
    expect(notifications([1, 2, 3], {
      type: UPDATE_PATH,
    })).eql([]);
  });
});
