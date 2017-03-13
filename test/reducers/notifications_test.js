import { expect } from "chai";

import notifications from "../../src/reducers/notifications";
import {
  NOTIFICATION_ADDED,
  NOTIFICATION_REMOVED,
  NOTIFICATION_CLEAR,
} from "../../src/constants";

describe("notifications reducer", () => {
  it("NOTIFICATION_ADDED", () => {
    expect(
      notifications([1, 2], {
        type: NOTIFICATION_ADDED,
        notification: 3,
      })
    ).eql([1, 2, 3]);

    expect(
      notifications([1, 2], {
        type: NOTIFICATION_ADDED,
        clear: true,
        notification: 3,
      })
    ).eql([3]);
  });

  it("NOTIFICATION_REMOVED", () => {
    expect(
      notifications([1, 2, 3], {
        type: NOTIFICATION_REMOVED,
        index: 1,
      })
    ).eql([1, 3]);
  });

  it("NOTIFICATION_CLEAR", () => {
    expect(
      notifications(
        [{ persistent: false }, { persistent: true }, { persistent: false }],
        {
          type: NOTIFICATION_CLEAR,
        }
      )
    ).eql([{ persistent: true }]);

    expect(
      notifications(
        [{ persistent: false }, { persistent: true }, { persistent: false }],
        {
          type: NOTIFICATION_CLEAR,
          force: true,
        }
      )
    ).eql([]);
  });
});
