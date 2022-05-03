import createSagaMiddleware from "redux-saga";
import createRootReducer from "../reducers";
import rootSaga from "../sagas";
import { createHashHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { routerMiddleware } from "connected-react-router";

const sagaMiddleware = createSagaMiddleware();

export const hashHistory = createHashHistory();

export function configureAppStore(initialState = {}, history = hashHistory) {
  const store = configureStore({
    reducer: createRootReducer(history),
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        thunk: false,
      }).concat(sagaMiddleware, routerMiddleware(history)),
    preloadedState: initialState,
  });
  // Every saga will receive the store getState() function as first argument
  // by default; this allows sagas to share the same signature and access the
  // state consistently.
  sagaMiddleware.run(rootSaga, store.getState.bind(store));
  return store;
}

export const store = configureAppStore();
