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


const common = {
  notifications: Notifications,
  sidebar: Sidebar,
};

export default (
  <Route path="/" component={App}>
    <IndexRoute components={{...common, content: HomePage}} />
    <Route path="/buckets/:bid/create-collection"
      components={{...common, content: CollectionCreatePage}} />
    <Route path="/buckets/:bid/collections/:cid/edit"
      components={{...common, content: CollectionEditPage}} />
    <Route path="/buckets/:bid/collections/:cid"
      components={{...common, content: CollectionListPage}} />
    <Route path="/buckets/:bid/collections/:cid/add"
      components={{...common, content: AddFormPage}} />
    <Route path="/buckets/:bid/collections/:cid/edit/:rid"
      components={{...common, content: EditFormPage}} />
    <Route path="/buckets/:bid/collections/:cid/bulk"
      components={{...common, content: BulkFormPage}} />
    <Route path="*" components={{
      sidebar: Sidebar,
      content: _ => <h1>Page not found.</h1>
    }}/>
  </Route>
);
