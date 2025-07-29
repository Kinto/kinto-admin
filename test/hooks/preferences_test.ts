import * as preferencesHooks from "@src/hooks/preferences";
import * as storageHooks from "@src/hooks/storage";

describe("preferences hooks", () => {
  const mock = vi.fn();
  vi.spyOn(storageHooks, "useLocalStorage").mockImplementation(mock);

  describe("useShowSidebar", () => {
    it("returns storage val and setVal", async () => {
      const setValMock = vi.fn();
      mock.mockReturnValue([false, setValMock]);
      const [val, setVal] = preferencesHooks.useShowSidebar();
      setVal(true);
      expect(val).toBe(false);
      expect(setValMock).toHaveBeenCalledWith(true);
    });
  });

  describe("useSimpleReview", () => {
    it("returns storage val and setVal", async () => {
      const setValMock = vi.fn();
      mock.mockReturnValue([false, setValMock]);
      const [val, setVal] = preferencesHooks.useSimpleReview();
      setVal(true);
      expect(val).toBe(false);
      expect(setValMock).toHaveBeenCalledWith(true);
    });
  });
});
