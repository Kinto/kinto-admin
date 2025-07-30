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

// TODO: add showExtraFields and showAllLines from simple review
