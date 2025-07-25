import { usePreferences } from "@src/hooks/preferences";
import * as localStore from "@src/store/localStore";
import { Preferences } from "@src/types";
import { act, renderHook } from "@testing-library/react";

describe("usePreferences", () => {
  beforeEach(() => {
    vi.restoreAllMocks(); // Clears previous spies
  });

  it("should return default preferences initially", async () => {
    vi.spyOn(localStore, "loadPreferences").mockResolvedValue(null);

    const { result } = renderHook(() => usePreferences());

    await vi.waitFor(() => {
      expect(result.current[0]).toEqual({ showSidebar: true });
    });
  });

  it("should load preferences from local store on mount", async () => {
    const storedPrefs: Preferences = { showSidebar: false };
    vi.spyOn(localStore, "loadPreferences").mockResolvedValue(storedPrefs);

    const { result } = renderHook(() => usePreferences());

    await vi.waitFor(() => {
      expect(result.current[0]).toEqual(storedPrefs);
    });
  });

  it("should not update preferences if loading fails or returns null", async () => {
    vi.spyOn(localStore, "loadPreferences").mockResolvedValue(null);

    const { result } = renderHook(() => usePreferences());

    await vi.waitFor(() => {
      expect(result.current[0]).toEqual({ showSidebar: true });
    });
  });

  it("should update and save preferences", async () => {
    vi.spyOn(localStore, "loadPreferences").mockResolvedValue(null);
    const saveSpy = vi.spyOn(localStore, "savePreferences").mockResolvedValue();

    const { result } = renderHook(() => usePreferences());
    const newPrefs: Preferences = { showSidebar: false };

    await act(async () => {
      await result.current[1](newPrefs);
    });

    expect(result.current[0]).toEqual(newPrefs);
    expect(saveSpy).toHaveBeenCalledWith(newPrefs);
  });
});
