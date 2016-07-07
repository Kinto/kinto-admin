import renderAdmin from "./app";

// Check for local plugins to enable for development.
const plugins = (process.env.KINTO_ADMIN_PLUGINS || "")
  .split(",")
  .filter(x => !!x)
  .map(pluginName => {
    try {
      return require(`../plugins/${pluginName}/index`);
    } catch(err) {
      console.warn(`Couldn't load plugin ${pluginName}: ${err}`);
    }
  });

renderAdmin(document.getElementById("app"), plugins);
