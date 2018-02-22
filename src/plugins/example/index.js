import React from "react";
import { takeEvery } from "redux-saga";
import { put } from "redux-saga/effects";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

const PLUGIN_ACTION_REQUEST = "PLUGIN_ACTION_REQUEST";
const PLUGIN_ACTION_SUCCESS = "PLUGIN_ACTION_SUCCESS";

// Test actions
function testActionRequest() {
  return { type: PLUGIN_ACTION_REQUEST };
}

function testActionSuccess() {
  return { type: PLUGIN_ACTION_SUCCESS, answer: 42 };
}

// Container setup
function mapStateToProps(state) {
  return { plugin: state.plugin };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ testActionRequest }, dispatch);
}

// Plugin view root container component
class TestPlugin extends React.Component {
  render() {
    const { plugin, testActionRequest } = this.props;
    return (
      <div>
        <h1>Hello from plugin!</h1>
        <p>Answer: {plugin.answer}</p>
        <p>
          <button onClick={testActionRequest}>Get answer</button>
        </p>
      </div>
    );
  }
}

const TestPluginContainer = connect(mapStateToProps, mapDispatchToProps)(
  TestPlugin
);

// Test saga
function* testSaga(getState, action) {
  yield new Promise(r => setTimeout(r, 1000));
  yield put(testActionSuccess(42));
}

// Plugin exports
const routes = [
  { path: "/test/plugin", components: { content: TestPluginContainer } },
];

export const sagas = [[takeEvery, PLUGIN_ACTION_REQUEST, testSaga]];

export const reducers = {
  plugin(state = { answer: 0 }, action) {
    switch (action.type) {
      case PLUGIN_ACTION_SUCCESS: {
        return { ...state, answer: action.answer };
      }
      default: {
        return state;
      }
    }
  },
};

export function register(store) {
  return {
    routes,
  };
}
