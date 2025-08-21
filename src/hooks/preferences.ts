import { useLocalStorage } from "./storage";

export function useShowSidebar(): [boolean, (boolean) => void] {
  const [val, setVal] = useLocalStorage("showSidebar", true);
  return [val, setVal] as [boolean, (boolean) => void];
}

export function useSimpleReview(): [boolean, (boolean) => void] {
  const [val, setVal] = useLocalStorage("useSimpleReview", true);
  return [val, setVal] as [boolean, (boolean) => void];
}

export function useSidebarFilter(): [string, (string) => void] {
  const [val, setVal] = useLocalStorage("sidebarFilter", null);
  return [val, setVal] as [string, (string) => void];
}

export function useSidebarShowReadonly(): [boolean, (boolean) => void] {
  const [val, setVal] = useLocalStorage("sidebarShowReadonly", false);
  return [val, setVal] as [boolean, (boolean) => void];
}

export function useShowDiffExtraFields(): [boolean, (boolean) => void] {
  const [val, setVal] = useLocalStorage("showDiffExtraFields", false);
  return [val, setVal] as [boolean, (boolean) => void];
}

export function useShowDiffAllLines(): [boolean, (boolean) => void] {
  const [val, setVal] = useLocalStorage("showDiffAllLines", false);
  return [val, setVal] as [boolean, (boolean) => void];
}

export function useShowNonHumans(
  byDefault: boolean
): [boolean, (boolean) => void] {
  const [val, setVal] = useLocalStorage("showNonHumans", byDefault);
  return [val, setVal] as [boolean, (boolean) => void];
}

export function useShowSignerPlugin(
  byDefault: boolean
): [boolean, (boolean) => void] {
  const [val, setVal] = useLocalStorage("showSignerPlugin", byDefault);
  return [val, setVal] as [boolean, (boolean) => void];
}

export function useUnifiedDiff(
  byDefault: boolean
): [boolean, (boolean) => void] {
  const [val, setVal] = useLocalStorage("unifiedDiff", byDefault);
  return [val, setVal] as [boolean, (boolean) => void];
}
