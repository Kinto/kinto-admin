import React from "react";
import { Route, IndexRoute, Link } from "react-router";
import App from "./containers/App";
import HomePage from "./containers/HomePage";
import Sidebar from "./containers/Sidebar";
import Notifications from "./containers/Notifications";
import CollectionListPage from "./containers/CollectionListPage";
import CollectionCreatePage from "./containers/CollectionCreatePage";
import AddFormPage from "./containers/AddFormPage";
import BulkFormPage from "./containers/BulkFormPage";
import EditFormPage from "./containers/EditFormPage";
import SettingsPage from "./containers/SettingsPage";
import ResolvePage from "./containers/ResolvePage";


const LinkBack = (props) => {
  const {name} = props.params;
  const to = name ? `/collections/${name}` : "/";
  return (
    <div className="list-group">
      <Link className="list-group-item" to={to}>
        <i className="glyphicon glyphicon-chevron-left" />
        {" Back"}
      </Link>
    </div>
  );
};

const common = {
  notifications: Notifications,
  sidebar: Sidebar,
};

export default (
  <Route path="/" component={App}>
    <IndexRoute components={{...common, content: HomePage}} />
    <Route path="/buckets/:bucket/create-collection"
      components={{...common, content: CollectionCreatePage}} />
    <Route path="/buckets/:bucket/collections/:collection"
      components={{...common, content: CollectionListPage}} />
    {/* Obsolete kinto.js routes */}
    <Route path="/collections/:name"
      components={{...common, content: CollectionListPage}} />
    <Route path="/collections/:name/add"
      components={{...common, content: AddFormPage, linkBack: LinkBack}} />
    <Route path="/collections/:name/bulk"
      components={{...common, content: BulkFormPage, linkBack: LinkBack}} />
    <Route path="/collections/:name/edit/:id"
      components={{...common, content: EditFormPage, linkBack: LinkBack}} />
    <Route path="/collections/:name/resolve/:id"
      components={{...common, content: ResolvePage, linkBack: LinkBack}} />
    <Route path="/settings"
      components={{...common, content: SettingsPage}} />
    <Route path="*" components={{
      sidebar: Sidebar,
      content: _ => <h1>Page not found.</h1>
    }}/>
  </Route>
);
