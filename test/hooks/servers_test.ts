import { ANONYMOUS_AUTH } from "@src/constants";
import { useServerHistory } from "@src/hooks/servers";
import { act, renderHook } from "@testing-library/react";

const SERVER_HISTORY_KEY = "kinto-admin-server-history";

describe("useServerHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return an empty history by default", () => {
    const { result } = renderHook(() => useServerHistory());

    expect(result.current.serverHistory).toStrictEqual([]);
  });

  it("should return an empty history if the stored value is not an array", () => {
    localStorage.setItem(SERVER_HISTORY_KEY, JSON.stringify({ foo: "bar" }));
    const { result } = renderHook(() => useServerHistory());

    expect(result.current.serverHistory).toStrictEqual([]);
  });

  it("should load legacy servers", () => {
    localStorage.setItem(
      SERVER_HISTORY_KEY,
      JSON.stringify(["someServer", "otherServer"])
    );
    const { result } = renderHook(() => useServerHistory());

    expect(result.current.serverHistory).toStrictEqual([
      { server: "someServer", authType: ANONYMOUS_AUTH },
      { server: "otherServer", authType: ANONYMOUS_AUTH },
    ]);
  });

  it("should add server to recent history", () => {
    const { result } = renderHook(() => useServerHistory());

    act(() => {
      result.current.addServerToHistory("http://server.test/v1", "basicauth");
    });

    expect(result.current.serverHistory).toStrictEqual([
      { server: "http://server.test/v1", authType: "basicauth" },
    ]);
    expect(JSON.parse(localStorage.getItem(SERVER_HISTORY_KEY))).toStrictEqual([
      { server: "http://server.test/v1", authType: "basicauth" },
    ]);
  });

  it("should not prepend a duplicate entry in stack", () => {
    const { result } = renderHook(() => useServerHistory());

    act(() => {
      result.current.addServerToHistory("http://server.test/v1", "basicauth");
    });
    act(() => {
      result.current.addServerToHistory("http://other.test/v1", "anonymous");
    });
    act(() => {
      result.current.addServerToHistory("http://server.test/v1", "ldap");
    });

    expect(result.current.serverHistory).toStrictEqual([
      { server: "http://server.test/v1", authType: "ldap" },
      { server: "http://other.test/v1", authType: "anonymous" },
    ]);
  });

  it("should clear server history", () => {
    const { result } = renderHook(() => useServerHistory());

    act(() => {
      result.current.addServerToHistory("http://server.test/v1", "basicauth");
    });
    act(() => {
      result.current.clearServerHistory();
    });

    expect(result.current.serverHistory).toStrictEqual([]);
  });

  it("should share history between hook instances", () => {
    const { result: first } = renderHook(() => useServerHistory());
    const { result: second } = renderHook(() => useServerHistory());

    act(() => {
      first.current.addServerToHistory("http://server.test/v1", "basicauth");
    });

    expect(second.current.serverHistory).toStrictEqual([
      { server: "http://server.test/v1", authType: "basicauth" },
    ]);
  });
});
