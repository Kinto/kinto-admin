import React from "react";

import renderAdmin from "./app";


const plugins = [];

class TestPlugin extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello from plugin!</h1>
      </div>
    );
  }
}

// Sample fake plugin
const routes = [
  {path: "/test/plugin", components: {content: TestPlugin}}
];
const actions = [];
const reducers = {};
const sagas = [];

// Register it
plugins.push({
  routes,
  actions,
  reducers,
  sagas,
});

renderAdmin(document.getElementById("app"), plugins);
