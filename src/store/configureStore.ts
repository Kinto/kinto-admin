import createSagaMiddleware from "redux-saga";
import createRootReducer from "../reducers";
import rootSaga from "../sagas";
import { createHashHistory } from "history";
import { configureStore } from "@reduxjs/toolkit";
import { createReduxHistoryContext } from "redux-first-history";

const sagaMiddleware = createSagaMiddleware();
const configureAppStoreAndHistory = (
  initialState = {},
  initialHistory = createHashHistory()
) => {
  const { createReduxHistory, routerMiddleware, routerReducer } =
    createReduxHistoryContext({ history: initialHistory });
  const store = configureStore({
    reducer: createRootReducer(routerReducer),
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        thunk: false,
      }).concat(sagaMiddleware, routerMiddleware),
    preloadedState: initialState,
  });
  const history = createReduxHistory(store);
  // Every saga will receive the store getState() function as first argument
  // by default; this allows sagas to share the same signature and access the
  // state consistently.
  sagaMiddleware.run(rootSaga, store.getState.bind(store));
  return { store, history };
};

const { store, history } = configureAppStoreAndHistory();
export { store, history, configureAppStoreAndHistory };
