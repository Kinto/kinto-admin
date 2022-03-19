import { TypedUseSelectorHook, useSelector } from "react-redux";
import type { AppState } from "./types";

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
