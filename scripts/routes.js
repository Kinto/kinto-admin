/* @flow */

import React from "react";
import { Route, IndexRoute } from "react-router";
import App from "./containers/App";
import HomePage from "./containers/HomePage";
import Sidebar from "./containers/Sidebar";
import Notifications from "./containers/Notifications";
import BucketCreatePage from "./containers/BucketCreatePage";
import BucketEditPage from "./containers/BucketEditPage";
import CollectionListPage from "./containers/CollectionListPage";
import CollectionCreatePage from "./containers/CollectionCreatePage";
import CollectionEditPage from "./containers/CollectionEditPage";
import AddFormPage from "./containers/AddFormPage";
import BulkFormPage from "./containers/BulkFormPage";
import EditFormPage from "./containers/EditFormPage";

import * as sessionActions from "./actions/session";
import * as collectionActions from "./actions/collection";
import * as notificationActions from "./actions/notifications";


const common = {
  notifications: Notifications,
  sidebar: Sidebar,
};

function onAuthEnter(store: Object, {params}) {
  // XXX there's an odd bug where we enter twice this function while we clearly
  // load it once. Note that the state qs value changes, but I don't know why...
  const {payload, token} = params;
  // Check for an incoming authentication.
  if (payload && token) {
    try {
      const {server, redirectURL, authType} = JSON.parse(atob(payload));
      const credentials = {token};
      store.dispatch(sessionActions.setup({
        server,
        authType,
        credentials,
        redirectURL,
      }));
    } catch(error) {
      store.dispatch(notificationActions.notifyError(error));
    }
  }
}

function onCollectionListEnter(store: Object, {params}) {
  const {bid, cid} = params;
  const {session, collection} = store.getState();
  if (!session.authenticated) {
    // We're not authneticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and then lose their session.
    return;
  }
  const {sort} = collection;
  store.dispatch(collectionActions.listRecords(bid, cid, sort));
}

export default function getRoutes(store: Object) {
  return (
    <Route path="/" component={App}>
      <IndexRoute components={{...common, content: HomePage}} />
      <Route path="/auth/:payload/:token"
        components={{...common, content: HomePage}}
        onEnter={onAuthEnter.bind(null, store)} />
      <Route path="/buckets/create-bucket"
        components={{...common, content: BucketCreatePage}} />
      <Route path="/buckets/:bid/edit"
        components={{...common, content: BucketEditPage}} />
      <Route path="/buckets/:bid/create-collection"
        components={{...common, content: CollectionCreatePage}} />
      <Route path="/buckets/:bid/collections/:cid/edit"
        components={{...common, content: CollectionEditPage}} />
      <Route path="/buckets/:bid/collections/:cid"
        components={{...common, content: CollectionListPage}}
        onEnter={onCollectionListEnter.bind(null, store)}  />
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
}
