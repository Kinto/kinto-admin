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

  describe("useSidebarFilter", () => {
    it("returns storage val and setVal", async () => {
      const setValMock = vi.fn();
      mock.mockReturnValue(["workspace", setValMock]);
      const [val, setVal] = preferencesHooks.useSidebarFilter();
      setVal("main");
      expect(val).toBe("workspace");
      expect(setValMock).toHaveBeenCalledWith("main");
    });
  });

  describe("useSidebarShowReadonly", () => {
    it("returns storage val and setVal", async () => {
      const setValMock = vi.fn();
      mock.mockReturnValue([false, setValMock]);
      const [val, setVal] = preferencesHooks.useSidebarShowReadonly();
      setVal(true);
      expect(val).toBe(false);
      expect(setValMock).toHaveBeenCalledWith(true);
    });
  });

  describe("useShowDiffExtraFields", () => {
    it("returns storage val and setVal", async () => {
      const setValMock = vi.fn();
      mock.mockReturnValue([false, setValMock]);
      const [val, setVal] = preferencesHooks.useShowDiffExtraFields();
      setVal(true);
      expect(val).toBe(false);
      expect(setValMock).toHaveBeenCalledWith(true);
    });
  });

  describe("useShowDiffAllLines", () => {
    it("returns storage val and setVal", async () => {
      const setValMock = vi.fn();
      mock.mockReturnValue([false, setValMock]);
      const [val, setVal] = preferencesHooks.useShowDiffAllLines();
      setVal(true);
      expect(val).toBe(false);
      expect(setValMock).toHaveBeenCalledWith(true);
    });
  });

  describe("useShowNonHumans", () => {
    it("returns storage val and setVal", async () => {
      const setValMock = vi.fn();
      mock.mockReturnValue([false, setValMock]);
      const [val, setVal] = preferencesHooks.useShowNonHumans(false);
      setVal(true);
      expect(val).toBe(false);
      expect(setValMock).toHaveBeenCalledWith(true);
    });
  });

  describe("useShowSignerPlugin", () => {
    it("returns storage val and setVal", async () => {
      const setValMock = vi.fn();
      mock.mockReturnValue([false, setValMock]);
      const [val, setVal] = preferencesHooks.useShowSignerPlugin(false);
      setVal(true);
      expect(val).toBe(false);
      expect(setValMock).toHaveBeenCalledWith(true);
    });
  });
});
