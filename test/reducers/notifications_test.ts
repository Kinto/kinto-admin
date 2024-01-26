import { NOTIFICATION_ADDED, NOTIFICATION_REMOVED } from "@src/constants";
import notifications from "@src/reducers/notifications";

describe("notifications reducer", () => {
  it("NOTIFICATION_ADDED", () => {
    expect(
      notifications([1, 2], {
        type: NOTIFICATION_ADDED,
        notification: 3,
      })
    ).toStrictEqual([1, 2, 3]);
  });

  it("NOTIFICATION_REMOVED", () => {
    expect(
      notifications([1, 2, 3], {
        type: NOTIFICATION_REMOVED,
        index: 1,
      })
    ).toStrictEqual([1, 3]);
  });
});
