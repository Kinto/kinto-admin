/* @flow */

import React, { Component } from "react";
import { Route, IndexRoute, IndexRedirect } from "react-router";
import { mergeObjects } from "react-jsonschema-form/lib/utils";

import { isObject } from "./utils";
import { flattenPluginsRoutes } from "./plugin";
import App from "./containers/App";
import HomePage from "./containers/HomePage";
import Sidebar from "./containers/Sidebar";
import Notifications from "./containers/Notifications";
import BucketCreatePage from "./containers/bucket/BucketCreatePage";
import BucketEditPage from "./containers/bucket/BucketEditPage";
import BucketPermissionsPage from "./containers/bucket/BucketPermissionsPage";
import BucketCollectionsPage from "./containers/bucket/BucketCollectionsPage";
import BucketGroupsPage from "./containers/bucket/BucketGroupsPage";
import BucketHistoryPage from "./containers/bucket/BucketHistoryPage";
import GroupCreatePage from "./containers/group/GroupCreatePage";
import GroupEditPage from "./containers/group/GroupEditPage";
import GroupHistoryPage from "./containers/group/GroupHistoryPage";
import CollectionRecordsPage from "./containers/collection/CollectionRecordsPage";
import CollectionHistoryPage from "./containers/collection/CollectionHistoryPage";
import CollectionCreatePage from "./containers/collection/CollectionCreatePage";
import CollectionEditPage from "./containers/collection/CollectionEditPage";
import CollectionPermissionsPage from "./containers/collection/CollectionPermissionsPage";
import RecordCreatePage from "./containers/record/RecordCreatePage";
import RecordBulkPage from "./containers/record/RecordBulkPage";
import RecordEditPage from "./containers/record/RecordEditPage";
import RecordHistoryPage from "./containers/record/RecordHistoryPage";
import * as sessionActions from "./actions/session";
import * as bucketActions from "./actions/bucket";
import * as collectionActions from "./actions/collection";
import * as groupActions from "./actions/group";
import * as recordActions from "./actions/record";
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
      const message = "Couldn't proceed with authentication.";
      store.dispatch(notificationActions.notifyError(message, error));
    }
  }
}

function onCollectionRecordsEnter(store: Object, {params}) {
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
  const {session, routing: {locationBeforeTransitions: {query: {since}}}} = store.getState();
  if (!session.authenticated) {
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  store.dispatch(collectionActions.listCollectionHistory(bid, cid, since));
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

function onBucketHistoryEnter(store: Object, {params}) {
  const {bid} = params;
  const {session, routing: {locationBeforeTransitions: {query: {since}}}} = store.getState();
  if (!session.authenticated) {
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  store.dispatch(bucketActions.listBucketHistory(bid, since));
}

function onGroupHistoryEnter(store: Object, {params}) {
  const {bid, gid} = params;
  const {session, routing: {locationBeforeTransitions: {query: {since}}}} = store.getState();
  if (!session.authenticated) {
    // We're not authenticated, skip requesting the list of records. This likely
    // occurs when users refresh the page and lose their session.
    return;
  }
  store.dispatch(groupActions.listGroupHistory(bid, gid, since));
}

function onRecordHistoryEnter(store: Object, {params}) {
  const {bid, cid, rid} = params;
  const {session, routing: {locationBeforeTransitions: {query: {since}}}} = store.getState();
  if (!session.authenticated) {
    return;
  }
  store.dispatch(recordActions.listRecordHistory(bid, cid, rid, since));
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
    <Route name="home" path="/" component={App}>
      <IndexRoute name="home" components={{...common, content: HomePage}} />
      {flattenPluginsRoutes(plugins, common)}
      <Route name="auth" path="/auth/:payload/:token"
        components={{...common, content: HomePage}}
        onEnter={onAuthEnter.bind(null, store)} />
      {/* /buckets */}
      <Route name="buckets" path="buckets">
        <IndexRedirect to="/" />
        {/* /buckets/:bid/create */}
        <Route name="create" path="create"
          components={{...common, content: BucketCreatePage}} />
        {/* /buckets/:bid */}
        <Route name=":bid" path=":bid">
          <IndexRedirect to="collections" />
          {/* /buckets/:bid/groups */}
          <Route name="groups" path="groups">
            <IndexRoute
              name="groups"
              components={{...common, content: BucketGroupsPage}}
              onEnter={onBucketPageEnter.bind(null, store, bucketActions.listBucketGroups)}
              onChange={onBucketPageEnter.bind(null, store, bucketActions.listBucketGroups)} />
            {/* /buckets/:bid/groups/create */}
            <Route name="create" path="create"
              components={{...common, content: GroupCreatePage}} />
            {/* /buckets/:bid/groups/:gid */}
            <Route name=":gid" path=":gid">
              <IndexRedirect to="edit" />
              {/* /buckets/:bid/groups/:gid/edit */}
              <Route name="properties" path="edit"
                components={{...common, content: GroupEditPage}} />
              {/* /buckets/:bid/groups/:gid/history */}
              <Route name="history" path="history"
                components={{...common, content: GroupHistoryPage}}
                onEnter={onGroupHistoryEnter.bind(null, store)}
                onChange={onGroupHistoryEnter.bind(null, store)} />
            </Route>
          </Route>
          {/* /buckets/:bid/edit */}
          <Route name="properties" path="edit"
            components={{...common, content: BucketEditPage}} />
          {/* /buckets/:bid/permissions */}
          <Route name="permissions" path="permissions"
            components={{...common, content: BucketPermissionsPage}} />
          {/* /buckets/:bid/history */}
          <Route name="history" path="history"
            components={{...common, content: BucketHistoryPage}}
            onEnter={onBucketHistoryEnter.bind(null, store)}
            onChange={onBucketHistoryEnter.bind(null, store)} />
          {/* /buckets/:bid/collections */}
          <Route name="collections" path="collections">
            <IndexRoute name="collections" components={{...common, content: BucketCollectionsPage}}
              onEnter={onBucketPageEnter.bind(null, store, bucketActions.listBucketCollections)}
              onChange={onBucketPageEnter.bind(null, store, bucketActions.listBucketCollections)} />
            {/* /buckets/:bid/collections/create */}
            <Route name="create" path="create"
              components={{...common, content: CollectionCreatePage}} />
            {/* /buckets/:bid/collections/:cid */}
            <Route name=":cid" path=":cid">
              <IndexRedirect to="records" />
              {/* /buckets/:bid/collections/:cid/records */}
              <Route name="records" path="records">
                <IndexRoute
                  name="records"
                  components={{...common, content: registerPluginsComponentHooks(CollectionRecordsPage, plugins)}}
                  onEnter={onCollectionRecordsEnter.bind(null, store)}
                  onChange={onCollectionRecordsEnter.bind(null, store)} />
                {/* /buckets/:bid/collections/:cid/records/create */}
                <Route name="create" path="add"
                  components={{...common, content: RecordCreatePage}} />
                {/* /buckets/:bid/collections/:cid/records/bulk */}
                <Route name="bulk create" path="bulk"
                  components={{...common, content: RecordBulkPage}} />
                {/* /buckets/:bid/collections/:cid/records/:rid */}
                <Route name=":rid" path=":rid">
                  <IndexRedirect to="edit" />
                  {/* /buckets/:bid/collections/:cid/records/:rid/edit */}
                  <Route name="properties" path="edit"
                    components={{...common, content: RecordEditPage}} />
                  {/* /buckets/:bid/collections/:cid/history */}
                  <Route name="history" path="history"
                    components={{...common, content: RecordHistoryPage}}
                    onEnter={onRecordHistoryEnter.bind(null, store)}
                    onChange={onRecordHistoryEnter.bind(null, store)} />
                </Route>
              </Route>
              {/* /buckets/:bid/collections/:cid/edit */}
              <Route name="properties" path="edit"
                components={{...common, content: CollectionEditPage}} />
              {/* /buckets/:bid/collections/:cid/permissions */}
              <Route name="permissions" path="permissions"
                components={{...common, content: CollectionPermissionsPage}} />
              {/* /buckets/:bid/collections/:cid/history */}
              <Route name="history" path="history"
                components={{...common, content: CollectionHistoryPage}}
                onEnter={onCollectionHistoryEnter.bind(null, store)}
                onChange={onCollectionHistoryEnter.bind(null, store)} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route name="not found" path="*" components={{
        sidebar: Sidebar,
        content: _ => <h1>Page not found.</h1>
      }}/>
    </Route>
  );
}
