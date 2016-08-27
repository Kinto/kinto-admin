/* @flow */

import React, { Component } from "react";
import { Route, IndexRoute } from "react-router";
import { mergeObjects } from "react-jsonschema-form/lib/utils";

import { isObject } from "./utils";
import { flattenPluginsRoutes } from "./plugin";
import App from "./containers/App";
import HomePage from "./containers/HomePage";
import Sidebar from "./containers/Sidebar";
import Notifications from "./containers/Notifications";
import BucketCreatePage from "./containers/BucketCreatePage";
import BucketEditPage from "./containers/BucketEditPage";
import BucketCollectionsPage from "./containers/BucketCollectionsPage";
import BucketGroupsPage from "./containers/BucketGroupsPage";
import BucketHistoryPage from "./containers/BucketHistoryPage";
import GroupCreatePage from "./containers/GroupCreatePage";
import GroupEditPage from "./containers/GroupEditPage";
import GroupHistoryPage from "./containers/GroupHistoryPage";
import CollectionListPage from "./containers/CollectionListPage";
import CollectionHistoryPage from "./containers/CollectionHistoryPage";
import CollectionCreatePage from "./containers/CollectionCreatePage";
import CollectionEditPage from "./containers/CollectionEditPage";
import AddFormPage from "./containers/AddFormPage";
import BulkFormPage from "./containers/BulkFormPage";
import EditFormPage from "./containers/EditFormPage";
import * as sessionActions from "./actions/session";
import * as bucketActions from "./actions/bucket";
import * as collectionActions from "./actions/collection";
import * as groupActions from "./actions/group";
import * as notificationActions from "./actions/notifications";


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
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  const {sort} = collection;
  store.dispatch(collectionActions.listRecords(bid, cid, sort));
}

function onCollectionHistoryEnter(store: Object, {params}) {
  const {bid, cid} = params;
  const {session} = store.getState();
  if (!session.authenticated) {
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  store.dispatch(collectionActions.listCollectionHistory(bid, cid));
}

function onBucketPageEnter(store: Object, action: Function, {params}) {
  const {bid} = params;
  const {session} = store.getState();
  if (!session.authenticated) {
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  store.dispatch(action(bid));
}

function onGroupHistoryEnter(store: Object, {params}) {
  const {bid, gid} = params;
  const {session} = store.getState();
  if (!session.authenticated) {
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  store.dispatch(groupActions.listGroupHistory(bid, gid));
}

function registerPluginsComponentHooks(PageContainer, plugins) {
  // Extract the container wrapped component (see react-redux connect() API)
  const {WrappedComponent} = PageContainer;
  // By convention, the hook namespace is the wrapped component name
  const namespace = WrappedComponent.displayName;
  // Retrieve all the hooks if any
  const hooks = plugins
    .map(plugin => plugin.hooks)
    .filter(isObject);
  // Merge all the hooks together, recursively grouped by namespaces
  const mergedHooks = hooks.reduce((acc, hookObject) => {
    return mergeObjects(acc, hookObject, true);
  }, {});
  // Wrap the root component, augmenting its props with the plugin hooks for it.
  return class extends Component {
    render() {
      return (
        <PageContainer
          {...this.props}
          pluginHooks={mergedHooks[namespace] || {}} />
      );
    }
  };
}

export default function getRoutes(store: Object, plugins: Object[] = []) {
  const common = {
    notifications: registerPluginsComponentHooks(Notifications, plugins),
    sidebar: registerPluginsComponentHooks(Sidebar, plugins),
  };

  return (
    <Route path="/" component={App}>
      <IndexRoute name="Home" components={{...common, content: HomePage}} />
      {flattenPluginsRoutes(plugins, common)}
      <Route path="/auth/:payload/:token"
        components={{...common, content: HomePage}}
        onEnter={onAuthEnter.bind(null, store)} />
      <Route name="Buckets" path="buckets">
        <Route name="Create" path="create-bucket"
          components={{...common, content: BucketCreatePage}} />
        <Route name=":bid" path=":bid">
          <Route name="Create group" path="create-group"
            components={{...common, content: GroupCreatePage}} />
          <Route name="Groups" path="groups">
            <IndexRoute
              components={{...common, content: BucketGroupsPage}}
              onEnter={onBucketPageEnter.bind(null, store, bucketActions.listBucketGroups)}
              onChange={onBucketPageEnter.bind(null, store, bucketActions.listBucketGroups)} />
            <Route name=":gid" path=":gid">
              <Route name="Edit" path="edit"
                components={{...common, content: GroupEditPage}} />
              <Route name="History" path="history"
                components={{...common, content: GroupHistoryPage}}
                onEnter={onGroupHistoryEnter.bind(null, store)}
                onChange={onGroupHistoryEnter.bind(null, store)} />
            </Route>
          </Route>
          <Route name="Edit" path="edit"
            components={{...common, content: BucketEditPage}} />
          <Route name="History" path="history"
            components={{...common, content: BucketHistoryPage}}
            onEnter={onBucketPageEnter.bind(null, store, bucketActions.listBucketHistory)}
            onChange={onBucketPageEnter.bind(null, store, bucketActions.listBucketHistory)} />
          <Route name="Create collection" path="create-collection"
            components={{...common, content: CollectionCreatePage}} />
          <Route name="Collections" path="collections">
            <IndexRoute name="Collections" components={{...common, content: BucketCollectionsPage}}
              onEnter={onBucketPageEnter.bind(null, store, bucketActions.listBucketCollections)}
              onChange={onBucketPageEnter.bind(null, store, bucketActions.listBucketCollections)} />
            <Route name=":cid" path=":cid">
              <IndexRoute
                components={{
                  ...common,
                  content: registerPluginsComponentHooks(CollectionListPage, plugins),
                }}
                onEnter={onCollectionListEnter.bind(null, store)}
                onChange={onCollectionListEnter.bind(null, store)} />
              <Route name="Edit" path="edit"
                components={{...common, content: CollectionEditPage}} />
              <Route name="History" path="history"
                components={{...common, content: CollectionHistoryPage}}
                onEnter={onCollectionHistoryEnter.bind(null, store)}
                onChange={onCollectionHistoryEnter.bind(null, store)} />
              <Route name="Create" path="add"
                components={{...common, content: AddFormPage}} />
              <Route name="Edit" path="edit/:rid"
                components={{...common, content: EditFormPage}} />
              <Route name="Bulk create" path="bulk"
                components={{...common, content: BulkFormPage}} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" components={{
        sidebar: Sidebar,
        content: _ => <h1>Page not found.</h1>
      }}/>
    </Route>
  );
}
