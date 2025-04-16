import { configureStore } from "@reduxjs/toolkit";
import createRootReducer from "@src/reducers";
import rootSaga from "@src/sagas";
import createSagaMiddleware from "redux-saga";

const sagaMiddleware = createSagaMiddleware();

const configureAppStore = (initialState = {}) => {
  const store = configureStore({
    reducer: createRootReducer(),
    middleware: getDefaultMiddleware =>
      // TODO: disabling these checks is unsafe, but it looks like these checks are newer than our code that causes the errors
      // Find a way to fix or remove redux
      getDefaultMiddleware({
        thunk: false,
        serializableCheck: false,
        immutableCheck: false,
      }).concat(sagaMiddleware),
    preloadedState: initialState,
  });
  // Every saga will receive the store getState() function as first argument
  // by default; this allows sagas to share the same signature and access the
  // state consistently.
  sagaMiddleware.run(rootSaga, store.getState.bind(store));
  return { store };
};

const { store } = configureAppStore();
export { store, configureAppStore };
