/* @flow */
import type { SessionState, RouteParams, RouteLocation, BucketEntry } from "../types";

import React, { Component } from "react";

import AdminLink from "./AdminLink";
import url from "../url";


function SideBarLink(props) {
  const {currentPath, name, params, children, className, ...otherProps} = props;
  const targetUrl = url(name, params);
  const active = currentPath === targetUrl ? "active" : "";
  const classes = className !== undefined ? className : `list-group-item ${active}`;

  return (
    <AdminLink {...otherProps} name={name} params={params} className={classes}>
      {children}
    </AdminLink>
  );
}


function CollectionMenuEntry(props) {
  const {bucket: {id: bid}, collection, currentPath, active} = props;
  const {id: cid} = collection;
  const classes = [
    "list-group-item",
    "collections-menu-entry",
    active ? "active" : "",
  ].join(" ");
  return (
    <div className={classes}>
      <SideBarLink name="collection:records" params={{bid, cid}} currentPath={currentPath}
        className="">
        {collection.readonly
          ? <i className="glyphicon glyphicon-lock"/>
          : <i className="glyphicon glyphicon-align-justify"/>}
        {cid}
      </SideBarLink>
      <SideBarLink name="collection:attributes" params={{bid, cid}} currentPath={currentPath}
        className="collections-menu-entry-edit"
        title="Edit collection attributes">
        <i className="glyphicon glyphicon-cog" />
      </SideBarLink>
    </div>
  );
}

function BucketCollectionsMenu(props) {
  const {currentPath, bucket, collections, bid, cid} = props;
  return (
    <div className="collections-menu list-group">
      {
        collections.map((collection, index) => {
          return (
            <CollectionMenuEntry
              key={index}
              currentPath={currentPath}
              active={bid === bucket.id && cid === collection.id}
              bucket={bucket}
              collection={collection} />
          );
        })
      }
      <SideBarLink name="collection:create" params={{bid: bucket.id}} currentPath={currentPath}>
        <i className="glyphicon glyphicon-plus"/>
        Create collection
      </SideBarLink>
    </div>
  );
}

type BucketsMenuProps = {
  currentPath: string,
  buckets: BucketEntry[],
  bid: string,
  cid: string,
};

function filterBuckets(buckets, filters) {
  const {hideReadOnly, sort} = filters;
  return buckets.slice(0)
    .sort((a, b) => {
      switch (sort) {
        case "id": {
          return a.id <= b.id ? -1 : 1;
        }
        default:
        case "last_modified": {
          return a.last_modified >= b.last_modified ? -1 : 1;
        }
      }
    })
    .filter((bucket) => !(hideReadOnly && bucket.readonly));
}

class BucketsMenu extends Component {
  props: BucketsMenuProps;

  state: {
    hideReadOnly: boolean,
    sort: "last_modified" | "id",
  };

  constructor(props: BucketsMenuProps) {
    super(props);
    this.state = {hideReadOnly: false, sort: "last_modified"};
  }

  toggleReadOnly = () => {
    this.setState({hideReadOnly: !this.state.hideReadOnly});
  };

  toggleSort = (sort) => () => this.setState({sort});

  render() {
    const {sort} = this.state;
    const {currentPath, buckets, bid, cid} = this.props;
    const filteredBuckets = filterBuckets(buckets, this.state);
    return (
      <div>
        <div className="panel panel-default">
          <div className="list-group">
            <SideBarLink name="bucket:create" currentPath={currentPath}>
              <i className="glyphicon glyphicon-plus"/>
              Create bucket
            </SideBarLink>
          </div>
        </div>
        <div className="panel panel-default sidebar-filters">
          <div className="panel-heading">
            <strong>Filters</strong>
          </div>
          <div className="panel-body">
            <div className="checkbox">
              <label>
                <input type="checkbox" value={this.state.hideReadOnly}
                  onChange={this.toggleReadOnly}/>
                {" "}Hide readonly buckets
              </label>
            </div>
            <div className="btn-group btn-group-sm" role="group">
              <button type="button"
                className={`btn btn-default ${sort === "id" ? "active" : ""}`}
                onClick={this.toggleSort("id")}>
                <i className="glyphicon glyphicon-sort-by-alphabet"/>
                {" "}Id
              </button>
              <button type="button"
                className={`btn btn-default ${sort === "last_modified" ? "active" : ""}`}
                onClick={this.toggleSort("last_modified")}>
                <i className="glyphicon glyphicon-sort-by-alphabet-alt"/>
                {" "}Last modified
              </button>
            </div>
          </div>
        </div>
        {
          filteredBuckets.map((bucket, i) => {
            const {id, collections} = bucket;
            const current = bid === id;
            return (
              <div key={i} className={`panel panel-${current ? "info": "default"} bucket-menu`}>
                <div className="panel-heading">
                  {bucket.readonly
                    ? <i className="glyphicon glyphicon-lock"/>
                    : <i className={`glyphicon glyphicon-folder-${current ? "open" : "close"}`} />}
                  <strong>{id}</strong> bucket
                  <SideBarLink name="bucket:attributes" params={{bid: id}} currentPath={currentPath}
                    className="bucket-menu-entry-edit"
                    title="Manage bucket">
                    <i className="glyphicon glyphicon-cog"/>
                  </SideBarLink>
                </div>
                <BucketCollectionsMenu
                  bucket={bucket}
                  collections={collections}
                  currentPath={currentPath}
                  bid={bid}
                  cid={cid} />
              </div>
            );
          })
        }
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
    params: RouteParams,
    location: RouteLocation,
  };

  render() {
    const {session, params, location} = this.props;
    const {pathname: currentPath} = location;
    const {bid, cid} = params;
    const {buckets=[]} = session;
    return (
      <div>
        <div className="panel panel-default">
          <div className="list-group">
            <SideBarLink name="home" currentPath={currentPath}>Home</SideBarLink>
          </div>
        </div>
        {session.authenticated ?
          <BucketsMenu
            buckets={buckets}
            currentPath={currentPath}
            bid={bid}
            cid={cid} /> : null}
      </div>
    );
  }
}
