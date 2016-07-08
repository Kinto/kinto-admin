import renderAdmin from "./app";

// Check for local plugins to enable for development.
const plugins = (process.env.KINTO_ADMIN_PLUGINS || "")
  .split(",")
  .filter(x => !!x)
  .map(pluginName => {
    try {
      // XXX: For now we only support local core plugins
      if (pluginName === "signoff") {
        return require("../plugins/signoff/index");
      } else if (pluginName === "example") {
        return require("../plugins/example/index");
      }
      throw `Unknown plugin ${pluginName}`;
    } catch(err) {
      console.warn(`Couldn't load plugin ${pluginName}: ${err}`);
    }
  });

renderAdmin(document.getElementById("app"), plugins);
