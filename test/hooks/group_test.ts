import { useListHistory } from "@src/hooks/group";
import { act, renderHook } from "@testing-library/react";

describe("useListHistory", () => {
  let client, listHistory;

  beforeAll(() => {
    client = { listHistory() {} };
    setClient({
      bucket() {
        return client;
      },
    });
    const action = actions.listGroupHistory("bucket", "group");
    listHistory = saga.listHistory(() => ({}), action);
  });

  it("should call the group history enpoint and return the expected object", () => {
    const result = renderHook(() => {
      useListHistory("bid", "cid");
    });

    console.log(result);
  });
});
