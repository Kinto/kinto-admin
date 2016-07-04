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

export default function configureStore(initialState, plugins=[]) {
  const store = finalCreateStore(createRootReducer(plugins), initialState);
  // Every saga will receive the store getState() function as first argument
  // by default.
  // This allows sagas to share the same signature and access the state
  // consistently.
  sagaMiddleware.run(rootSaga, store.getState.bind(store), plugins);
  return store;
}
