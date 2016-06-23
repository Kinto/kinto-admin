import { createStore, applyMiddleware, compose } from "redux";
import { hashHistory } from "react-router";
import { routerMiddleware } from "react-router-redux";
import createSagaMiddleware from "redux-saga";
import rootReducer from "../reducers";
import rootSaga from "../sagas";


const sagaMiddleware = createSagaMiddleware();

const finalCreateStore = compose(
  applyMiddleware(sagaMiddleware, routerMiddleware(hashHistory))
)(createStore);

export default function configureStore(initialState) {
  const store = finalCreateStore(rootReducer, initialState);
  const getState = store.getState.bind(store);
  sagaMiddleware.run(rootSaga.bind(null, getState));
  return store;
}
