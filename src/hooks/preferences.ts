import { useLocalStorage } from "./storage";

export function useShowSidebar(): [boolean, (boolean) => void] {
  const [val, setVal] = useLocalStorage("showSidebar", true);
  return [val, setVal] as [boolean, (boolean) => void];
}

export function useSimpleReview(): [boolean, (boolean) => void] {
  const [val, setVal] = useLocalStorage("useSimpleReview", true);
  return [val, setVal] as [boolean, (boolean) => void];
}

// TODO: add sideBarFilter and sideBarShowReadonly (Kinto/kinto-admin#383)
// TODO: add showExtraFields and showAllLines from simple review
