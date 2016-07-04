import renderAdmin from "./app";


const plugins = [];

// Sample fake plugin
const routes = [];
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
