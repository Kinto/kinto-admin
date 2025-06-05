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
import { renderHook } from "@testing-library/react";

describe("session hooks", () => {
  const defaultLocalVal = { credentials: {} };
  let localStorageVal = undefined;
  const localStorageSet = val => {
    localStorageVal = val;
  };

  beforeEach(() => {
    logout();
    localStorageVal = undefined;
    vi.spyOn(client, "getClient").mockReturnValue({
      fetchServerInfo: vi.fn().mockResolvedValue(DEFAULT_SERVERINFO),
      listPermissions: vi.fn().mockResolvedValue([]),
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

  it("useAuth should call setupClient if the val is being set for the first time", () => {});

  describe("usePermissions", () => {});

  describe("useServerInfo", () => {});
});
