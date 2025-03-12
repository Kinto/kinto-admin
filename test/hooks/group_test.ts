import * as client from "@src/client";
import { useListHistory } from "@src/hooks/group";
import { mockNotifyError } from "@test/testUtils";
import { renderHook } from "@testing-library/react";

describe("useListHistory", () => {
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

  it("should call the group history enpoint and return the expected object", async () => {
    listHistoryMock.mockReturnValue({
      data: [],
      hasNextPage: false,
      next: null,
    });
    const { result } = renderHook(() => useListHistory("bid", "cid"));

    expect(result.current).toEqual({});

    await vi.waitFor(() => {
      expect(result.current).toMatchObject({
        data: [],
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
    const { result } = renderHook(() => useListHistory("bid", "cid"));

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

    renderHook(() => useListHistory("bid", "cid"));

    await vi.waitFor(() => {
      expect(notifyErrorMock).toHaveBeenCalledWith(
        "Error fetching group history",
        expect.any(Error)
      );
    });
  });
});
