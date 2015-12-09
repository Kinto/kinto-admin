import React from "react";
import { Route, IndexRoute } from "react-router";
import App from "./containers/App";
import HomePage from "./containers/HomePage";
import Sidebar from "./containers/Sidebar";
import Notifications from "./containers/Notifications";
import CollectionListPage from "./containers/CollectionListPage";
import AddFormPage from "./containers/AddFormPage";
import EditFormPage from "./containers/EditFormPage";
import SettingsPage from "./containers/SettingsPage";

const common = {
  notifications: Notifications,
  sidebar: Sidebar,
};

export default (
  <Route path="/" component={App}>
    <IndexRoute components={{...common, content: HomePage}} />
    <Route path="/collections/:name"
      components={{...common, content: CollectionListPage}} />
    <Route path="/collections/:name/add"
      components={{...common, content: AddFormPage}} />
    <Route path="/collections/:name/edit/:id"
      components={{...common, content: EditFormPage}} />
    <Route path="/settings"
      components={{...common, content: SettingsPage}} />
    <Route path="*" components={{
      sidebar: Sidebar,
      content: _ => <h1>Page not found.</h1>
    }}/>
  </Route>
);
