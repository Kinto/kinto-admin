import { useLocalStorage } from "@src/hooks/storage";
import { act, renderHook } from "@testing-library/react-hooks";

describe("useLocalStorage", () => {
  it("should return default value if a value isn't set yet", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "defaultValue")
    );

    expect(result.current[0]).toBe("defaultValue");
  });

  it("should get an existing value from localStorage if one exists", () => {
    localStorage.setItem("testKey", JSON.stringify("storedValue"));
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "defaultValue")
    );

    expect(result.current[0]).toBe("storedValue");
  });

  it("should set a new value in localStorage", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "defaultValue")
    );

    act(() => {
      result.current[1]("newValue");
    });

    expect(result.current[0]).toBe("newValue");
    expect(localStorage.getItem("testKey")).toBe(JSON.stringify("newValue"));
  });

  it("should update the value when localStorage changes from another session", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "defaultValue")
    );

    act(() => {
      localStorage.setItem("testKey", JSON.stringify("externalChange"));
      const event = new StorageEvent("storage", {
        oldValue: JSON.stringify("defaultValue"),
        newValue: JSON.stringify("externalChange"),
        key: "testKey",
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe("externalChange");
  });
});
