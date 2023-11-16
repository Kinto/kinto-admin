import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import type { AppDispatch, AppState } from "../types";

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
