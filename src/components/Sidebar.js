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
      <i className="glyphicon glyphicon-align-justify"/>
      <SideBarLink name="collection:records" params={{bid, cid}} currentPath={currentPath}
        className="">
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

function BucketsMenu(props) {
  const {currentPath, buckets, bid, cid} = props;
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
      {
        buckets.map((bucket, i) => {
          const {id, collections} = bucket;
          const current = bid === id;
          return (
            <div key={i} className={`panel panel-${current ? "info": "default"} bucket-menu`}>
              <div className="panel-heading">
                <i className={`glyphicon glyphicon-folder-${current ? "open" : "close"}`} />
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

export default class Sidebar extends Component {
  // This is useful to identify wrapped component for plugin hooks when code is
  // minified; see https://github.com/facebook/react/issues/4915
  static displayName = "Sidebar";

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
