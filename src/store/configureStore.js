/* @flow */
import type { Plugin } from "../types";

import { createStore, applyMiddleware, compose } from "redux";
import { hashHistory } from "react-router";
import { routerMiddleware } from "react-router-redux";
import createSagaMiddleware from "redux-saga";
import createRootReducer from "../reducers";
import rootSaga from "../sagas";

const sagaMiddleware = createSagaMiddleware();

const finalCreateStore = compose(
  applyMiddleware(sagaMiddleware, routerMiddleware(hashHistory)),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore);

export default function configureStore(
  initialState: Object,
  plugins: Plugin[] = []
) {
  // Each plugin exports a `reducers` attribute.
  const pluginReducers = plugins.map(({ reducers = {} }) => reducers);
  // Each plugin exports a `sagas` attribute.
  const pluginSagas = plugins.map(({ sagas = [] }) => sagas);

  const store = finalCreateStore(
    createRootReducer(pluginReducers),
    initialState
  );
  // Every saga will receive the store getState() function as first argument
  // by default; this allows sagas to share the same signature and access the
  // state consistently.
  sagaMiddleware.run(rootSaga, store.getState.bind(store), pluginSagas);
  return store;
}
