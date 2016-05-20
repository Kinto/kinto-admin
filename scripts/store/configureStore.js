import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import createSagaMiddleware from "redux-saga";
import rootReducer from "../reducers";
import rootSaga from "../sagas";


const sagaMiddleware = createSagaMiddleware();

const finalCreateStore = compose(
  applyMiddleware(thunk, sagaMiddleware)
)(createStore);

export default function configureStore(initialState) {
  sagaMiddleware.run(rootSaga);
  return finalCreateStore(rootReducer, initialState);
}
