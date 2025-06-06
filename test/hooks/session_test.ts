import * as client from "@src/client";
import { DEFAULT_SERVERINFO } from "@src/constants";
import * as serverHooks from "@src/hooks/servers";
import {
  logout,
  setAuth,
  useAuth,
  usePermissions,
  useServerInfo,
} from "@src/hooks/session";
import * as storageHooks from "@src/hooks/storage";
import { mockNotifyError, mockNotifyInfo } from "@test/testUtils";
import { renderHook } from "@testing-library/react";

describe("session hooks", () => {
  const defaultLocalVal = { credentials: {} };
  let serverInfoResult;
  let listPermissionsMock;
  let fetchServerInfoMock;
  let localStorageVal = undefined;
  const localStorageSet = val => {
    localStorageVal = val;
  };

  beforeEach(() => {
    logout();
    localStorageVal = undefined;
    serverInfoResult = { ...DEFAULT_SERVERINFO };
    fetchServerInfoMock = vi.fn().mockResolvedValue(serverInfoResult);
    listPermissionsMock = vi.fn().mockResolvedValue({ data: [] });
    vi.spyOn(client, "getClient").mockReturnValue({
      fetchServerInfo: fetchServerInfoMock,
      listPermissions: listPermissionsMock,
    });
    vi.spyOn(client, "setupClient");
    vi.spyOn(serverHooks, "addServer");
    vi.spyOn(storageHooks, "useLocalStorage").mockReturnValue([
      defaultLocalVal,
      localStorageSet,
    ]);
  });

  it("setAuth should processes the authentication object as expected", async () => {
    renderHook(() => useAuth());
    expect(localStorageVal).toBeUndefined();

    const testAuth = {
      authType: "openid-test",
      server: "test.server",
      tokenType: "foo",
      credentials: {
        username: "foo",
        password: "bar",
      },
    };
    const processedAuth = {
      ...testAuth,
      authType: "openid",
      provider: "test",
    };
    setAuth(testAuth);

    expect(localStorageVal).toStrictEqual(processedAuth);
    expect(serverHooks.addServer).toHaveBeenCalledWith(
      testAuth.server,
      testAuth.authType
    );
    expect(client.setupClient).toHaveBeenCalledWith(processedAuth);
  });

  it("logout should wipe state", async () => {
    const { result: auth } = renderHook(() => useAuth());
    await vi.waitFor(() => {
      expect(auth.current).not.toBeUndefined();
    });

    const { result: serverInfo } = renderHook(() => useServerInfo());
    await vi.waitFor(() => {
      expect(serverInfo.current).not.toBeUndefined();
    });

    const { result: permissions } = renderHook(() => usePermissions());
    await vi.waitFor(() => {
      expect(permissions.current).not.toBeUndefined();
    });

    logout();

    await vi.waitFor(() => {
      expect(localStorageVal).toBeUndefined();
      expect(permissions.current).toBeUndefined();
      expect(serverInfo.current).toBeUndefined();
    });
  });

  it("useAuth should call setupClient if the val is being set for the first time", async () => {
    const testVal = {
      foo: "bar",
      credentials: {},
    };
    vi.spyOn(storageHooks, "useLocalStorage").mockReturnValue([
      testVal,
      localStorageSet,
    ]);
    renderHook(() => useAuth());
    await vi.waitFor(() => {
      expect(client.setupClient).toHaveBeenCalledWith(testVal);
    });
  });

  describe("usePermissions", () => {
    beforeEach(async () => {
      const { result: auth } = renderHook(() => useAuth());
      await vi.waitFor(() => {
        expect(auth.current).not.toBeUndefined();
      });
    });

    it("should return undefined if serverInfo isn't loaded yet", async () => {
      let { result } = renderHook(() => usePermissions());
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => new Promise(resolve => setTimeout(resolve, 10)));
      expect(result.current).toBeUndefined();
    });

    it("should call the permissions endpoint once for all components and return the expected results", async () => {
      serverInfoResult.capabilities = {
        permissions_endpoint: true,
      };
      let { result: serverInfo } = renderHook(() => useServerInfo());
      await vi.waitFor(() => {
        expect(serverInfo.current).not.toBeUndefined();
      });
      let { result } = renderHook(() => usePermissions());
      renderHook(() => usePermissions());
      renderHook(() => usePermissions());
      renderHook(() => usePermissions());
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => {
        expect(result.current).toStrictEqual([]);
      });
      expect(listPermissionsMock).toHaveBeenCalledOnce();
    });

    it("should call notifyInfo if the permissions endpoint is not enabled", async () => {
      let { result: serverInfo } = renderHook(() => useServerInfo());
      await vi.waitFor(() => {
        expect(serverInfo.current).not.toBeUndefined();
      });
      const notifyInfoMock = mockNotifyInfo();
      let { result } = renderHook(() => usePermissions());
      await vi.waitFor(() => {
        expect(result.current).toStrictEqual([]);
      });
      expect(notifyInfoMock).toHaveBeenCalledOnce();
    });

    it("should call notifyError if a client error is thrown", async () => {
      let { result: serverInfo } = renderHook(() => useServerInfo());
      await vi.waitFor(() => {
        expect(serverInfo.current).not.toBeUndefined();
      });
      const notifyErrorMock = mockNotifyError();
      listPermissionsMock.mockRejectedValue(new Error("Test foo"));
      let { result } = renderHook(() => usePermissions());
      await vi.waitFor(() => {
        expect(result.current).toStrictEqual([]);
      });
      expect(notifyErrorMock).toHaveBeenCalledWith(
        "Unable to load permissions",
        expect.any(Error)
      );
    });
  });

  describe("useServerInfo", () => {
    beforeEach(async () => {
      const { result: auth } = renderHook(() => useAuth());
      await vi.waitFor(() => {
        expect(auth.current).not.toBeUndefined();
      });
    });

    it("should call the server info endpoint once for all components and return the expected result", async () => {
      let { result } = renderHook(() => useServerInfo());
      renderHook(() => useServerInfo());
      renderHook(() => useServerInfo());
      renderHook(() => useServerInfo());
      renderHook(() => useServerInfo());
      expect(result.current).toBeUndefined();
      await vi.waitFor(() => {
        expect(result.current).toStrictEqual(serverInfoResult);
      });
      expect(fetchServerInfoMock).toHaveBeenCalledOnce();
    });

    it("should call notifyError if a client error is thrown", async () => {
      const notifyErrorMock = mockNotifyError();
      fetchServerInfoMock.mockRejectedValue(new Error("Test foo"));
      renderHook(() => useServerInfo());
      await vi.waitFor(() => {
        expect(notifyErrorMock).toHaveBeenCalledWith(
          expect.stringContaining("Could not reach server"),
          expect.any(Error)
        );
      });
    });
  });
});
