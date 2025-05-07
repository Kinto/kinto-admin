import * as client from "@src/client";
import { useGroupHistory } from "@src/hooks/group";
import { mockNotifyError } from "@test/testUtils";
import { renderHook } from "@testing-library/react";

describe("useGroupHistory", () => {
  let listHistoryMock;

  beforeAll(() => {
    listHistoryMock = vi.fn();
    vi.spyOn(client, "getClient").mockReturnValue({
      bucket: bid => {
        return {
          listHistory: listHistoryMock,
        };
      },
    });
  });

  it("should call the history enpoint and return the expected results filtered on group id", async () => {
    listHistoryMock.mockReturnValue({
      data: [{ foo: "bar" }],
      hasNextPage: false,
      next: null,
    });
    const { result } = renderHook(() => useGroupHistory("bid", "gid"));

    expect(result.current).toEqual({});

    await vi.waitFor(() => {
      expect(result.current).toMatchObject({
        data: [{ foo: "bar" }],
        hasNextPage: false,
      });
    });

    expect(listHistoryMock).toHaveBeenCalled();
  });

  it("should append the results when using the next function", async () => {
    listHistoryMock.mockReturnValue({
      data: Array.from(Array(10).keys()),
      hasNextPage: true,
      next: () => {
        return {
          data: Array.from(Array(10).keys()),
          hasNextPage: false,
          next: null,
        };
      },
    });
    const { result } = renderHook(() => useGroupHistory("bid", "gid"));

    expect(result.current).toEqual({});

    await vi.waitFor(() => {
      expect(result.current.data).toHaveLength(10);
      expect(result.current.hasNextPage).toBeTruthy();
    });

    expect(listHistoryMock).toHaveBeenCalled();
    result.current.next();

    await vi.waitFor(() => {
      expect(result.current.data).toHaveLength(20);
      expect(result.current.hasNextPage).toBeFalsy();
    });
  });

  it("should create an error message when an exception occurs", async () => {
    let notifyErrorMock = mockNotifyError();
    listHistoryMock.mockImplementation(() => {
      throw new Error("test error");
    });

    renderHook(() => useGroupHistory("bid", "gid"));

    await vi.waitFor(() => {
      expect(notifyErrorMock).toHaveBeenCalledWith(
        "Error fetching group history",
        expect.any(Error)
      );
    });
  });
});
