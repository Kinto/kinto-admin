/**
 * Note: The plugin API is experimental and likely to change over time. Don't
 * use it if you bet on stability.
 */
import React from "react";
import { CreateRoute } from "./routes";

export function flattenPluginsRoutes(plugins: any[]) {
  return plugins.reduce((acc, { routes = [] }) => {
    const pluginRoutes = routes.map((route, key) => {
      const { component, title, ...props } = route;
      return (
        <CreateRoute
          exact
          key={key}
          title={title}
          {...props}
          component={component}
        />
      );
    });
    return [...acc, ...pluginRoutes];
  }, []);
}
