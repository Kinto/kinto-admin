/* @flow */
import type {
  SessionState,
  SettingsState,
  RouteParams,
  RouteLocation,
  BucketEntry,
} from "../types";

import React, { Component } from "react";

import Spinner from "./Spinner";
import AdminLink from "./AdminLink";
import url from "../url";

function SideBarLink(props) {
  const {
    currentPath,
    name,
    params,
    children,
    className,
    ...otherProps
  } = props;
  const targetUrl = url(name, params);
  const active = currentPath === targetUrl ? "active" : "";
  const classes = className !== undefined
    ? className
    : `list-group-item ${active}`;

  return (
    <AdminLink {...otherProps} name={name} params={params} className={classes}>
      {children}
    </AdminLink>
  );
}

function CollectionMenuEntry(props) {
  const { bucket: { id: bid }, collection, currentPath, active } = props;
  const { id: cid } = collection;
  const classes = [
    "list-group-item",
    "collections-menu-entry",
    active ? "active" : "",
  ].join(" ");
  return (
    <div className={classes}>
      <SideBarLink
        name="collection:records"
        params={{ bid, cid }}
        currentPath={currentPath}
        className="">
        {collection.readonly
          ? <i className="glyphicon glyphicon-lock" />
          : <i className="glyphicon glyphicon-align-justify" />}
        {cid}
      </SideBarLink>
      <SideBarLink
        name="collection:attributes"
        params={{ bid, cid }}
        currentPath={currentPath}
        className="collections-menu-entry-edit"
        title="Edit collection attributes">
        <i className="glyphicon glyphicon-cog" />
      </SideBarLink>
    </div>
  );
}

function BucketCollectionsMenu(props) {
  const {
    currentPath,
    bucket,
    collections,
    bid,
    cid,
    sidebarMaxListedCollections,
  } = props;
  // collections always contains one more item than what's configured in
  // sidebarMaxListedCollections, so we can render a link to the paginated list
  // of collections. Still, we only want to list that configured number of
  // collections for this bucket menu.
  const slicedCollections = sidebarMaxListedCollections !== null
    ? collections.slice(0, sidebarMaxListedCollections)
    : collections;
  return (
    <div className="collections-menu list-group">
      {slicedCollections.map((collection, index) => {
        return (
          <CollectionMenuEntry
            key={index}
            currentPath={currentPath}
            active={bid === bucket.id && cid === collection.id}
            bucket={bucket}
            collection={collection}
          />
        );
      })}
      {sidebarMaxListedCollections != null &&
        collections.length > sidebarMaxListedCollections &&
        <SideBarLink
          name="bucket:collections"
          params={{ bid: bucket.id }}
          currentPath={currentPath}>
          <i className="glyphicon glyphicon-option-horizontal" />
          See all collections
        </SideBarLink>}
      <SideBarLink
        name="collection:create"
        params={{ bid: bucket.id }}
        currentPath={currentPath}>
        <i className="glyphicon glyphicon-plus" />
        Create collection
      </SideBarLink>
    </div>
  );
}

type BucketsMenuProps = {
  currentPath: string,
  busy: boolean,
  buckets: BucketEntry[],
  bid: string,
  cid: string,
  sidebarMaxListedCollections: ?number,
};

function filterBuckets(buckets, filters) {
  const { hideReadOnly, search } = filters;
  return buckets
    .slice(0)
    .reduce(
      (acc, bucket) => {
        if (search == null || bucket.id.includes(search)) {
          return [...acc, bucket];
        } else if (bucket.collections.some(c => c.id.includes(search))) {
          return [
            ...acc,
            {
              ...bucket,
              collections: bucket.collections.filter(c =>
                c.id.includes(search)),
            },
          ];
        } else {
          return acc;
        }
      },
      []
    )
    .filter(bucket => !(hideReadOnly && bucket.readonly));
}

class BucketsMenu extends Component {
  props: BucketsMenuProps;

  state: {
    hideReadOnly: boolean,
    search: ?string,
  };

  constructor(props: BucketsMenuProps) {
    super(props);
    this.state = { hideReadOnly: false, search: null };
  }

  toggleReadOnly = () => {
    this.setState({ hideReadOnly: !this.state.hideReadOnly });
  };

  resetSearch = event => {
    event.preventDefault();
    this.setState({ search: null });
  };

  updateSearch = event => {
    this.setState({ search: event.target.value || null });
  };

  render() {
    const {
      currentPath,
      busy,
      buckets,
      bid,
      cid,
      sidebarMaxListedCollections,
    } = this.props;
    const filteredBuckets = filterBuckets(buckets, this.state);
    return (
      <div>
        <div className="panel panel-default">
          <div className="list-group">
            <SideBarLink name="bucket:create" currentPath={currentPath}>
              <i className="glyphicon glyphicon-plus" />
              Create bucket
            </SideBarLink>
          </div>
        </div>
        <div className="panel panel-default sidebar-filters">
          <div className="panel-heading">
            <strong>Filters</strong>
          </div>
          <form className="form panel-body">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Filter bucket/collection name"
                value={this.state.search || ""}
                onInput={this.updateSearch}
              />
              <span className="input-group-addon">
                <a href="" className="clear" onClick={this.resetSearch}>
                  <i className="glyphicon glyphicon-remove-sign" />
                </a>
              </span>
            </div>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  value={this.state.hideReadOnly}
                  onChange={this.toggleReadOnly}
                />
                {" "}Hide readonly buckets
              </label>
            </div>
          </form>
        </div>
        {busy
          ? <Spinner />
          : filteredBuckets.map((bucket, i) => {
              const { id, collections } = bucket;
              const current = bid === id;
              return (
                <div
                  key={i}
                  className={
                    `panel panel-${current ? "info" : "default"} bucket-menu`
                  }>
                  <div className="panel-heading">
                    {bucket.readonly
                      ? <i className="glyphicon glyphicon-lock" />
                      : <i
                          className={
                            `glyphicon glyphicon-folder-${current ? "open" : "close"}`
                          }
                        />}
                    <strong>{id}</strong> bucket
                    <SideBarLink
                      name="bucket:attributes"
                      params={{ bid: id }}
                      currentPath={currentPath}
                      className="bucket-menu-entry-edit"
                      title="Manage bucket">
                      <i className="glyphicon glyphicon-cog" />
                    </SideBarLink>
                  </div>
                  <BucketCollectionsMenu
                    bucket={bucket}
                    collections={collections}
                    currentPath={currentPath}
                    bid={bid}
                    cid={cid}
                    sidebarMaxListedCollections={sidebarMaxListedCollections}
                  />
                </div>
              );
            })}
      </div>
    );
  }
}

export default class Sidebar extends Component {
  // This is useful to identify wrapped component for plugin hooks when code is
  // minified; see https://github.com/facebook/react/issues/4915
  static displayName = "Sidebar";

  props: {
    session: SessionState,
    settings: SettingsState,
    params: RouteParams,
    location: RouteLocation,
  };

  render() {
    const { session, settings, params, location } = this.props;
    const { pathname: currentPath } = location;
    const { bid, cid } = params;
    const { busy, authenticated, buckets = [] } = session;
    const { sidebarMaxListedCollections } = settings;
    return (
      <div>
        <div className="panel panel-default">
          <div className="list-group">
            <SideBarLink name="home" currentPath={currentPath}>
              Home
            </SideBarLink>
          </div>
        </div>
        {authenticated &&
          <BucketsMenu
            busy={busy}
            buckets={buckets}
            currentPath={currentPath}
            bid={bid}
            cid={cid}
            sidebarMaxListedCollections={sidebarMaxListedCollections}
          />}
      </div>
    );
  }
}
