import React from "react";
import { Route, IndexRoute } from "react-router";
import App from "./containers/App";
import HomePage from "./containers/HomePage";
import Sidebar from "./containers/Sidebar";
import Notifications from "./containers/Notifications";
import CollectionListPage from "./containers/CollectionListPage";
import CollectionCreatePage from "./containers/CollectionCreatePage";
import CollectionEditPage from "./containers/CollectionEditPage";
import AddFormPage from "./containers/AddFormPage";
import BulkFormPage from "./containers/BulkFormPage";
import EditFormPage from "./containers/EditFormPage";
import ResolvePage from "./containers/ResolvePage";


const LinkBack = () => {
  return (
    <div className="list-group">
      <a className="list-group-item" href="javascript:history.go(-1)">
        <i className="glyphicon glyphicon-chevron-left" />
        {" Back"}
      </a>
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
    <Route path="/buckets/:bid/create-collection"
      components={{...common, content: CollectionCreatePage, linkBack: LinkBack}} />
    <Route path="/buckets/:bid/collections/:cid/edit"
      components={{...common, content: CollectionEditPage, linkBack: LinkBack}} />
    <Route path="/buckets/:bid/collections/:cid"
      components={{...common, content: CollectionListPage}} />
    <Route path="/buckets/:bid/collections/:cid/add"
      components={{...common, content: AddFormPage, linkBack: LinkBack}} />
    {/* Obsolete kinto.js routes */}
    <Route path="/collections/:name/bulk"
      components={{...common, content: BulkFormPage, linkBack: LinkBack}} />
    <Route path="/collections/:name/edit/:id"
      components={{...common, content: EditFormPage, linkBack: LinkBack}} />
    <Route path="/collections/:name/resolve/:id"
      components={{...common, content: ResolvePage, linkBack: LinkBack}} />
    <Route path="*" components={{
      sidebar: Sidebar,
      content: _ => <h1>Page not found.</h1>
    }}/>
  </Route>
);
