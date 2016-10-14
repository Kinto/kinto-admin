import React, { Component } from "react";

import AdminLink from "./AdminLink";



function activeIfPathname(location, pathname) {
  const active = location.pathname === pathname ? "active" : "";
  return `list-group-item ${active}`;
}

function CollectionMenuEntry(props) {
  const {bucket: {id: bid}, collection, active} = props;
  const {id: cid} = collection;
  const classes = [
    "list-group-item",
    "collections-menu-entry",
    active ? "active" : "",
  ].join(" ");
  return (
    <div className={classes}>
      <i className="glyphicon glyphicon-align-justify"/>
      <AdminLink name="collection:records" params={{bid, cid}}>{cid}</AdminLink>
      <AdminLink name="collection:attributes" params={{bid, cid}}
        className="collections-menu-entry-edit"
        title="Edit collection attributes">
        <i className="glyphicon glyphicon-cog" />
      </AdminLink>
    </div>
  );
}

function BucketCollectionsMenu(props) {
  const {active, bucket, collections, bid, cid} = props;
  return (
    <div className="collections-menu list-group">
      {
        collections.map((collection, index) => {
          return (
            <CollectionMenuEntry
              key={index}
              active={bid === bucket.id && cid === collection.id}
              bucket={bucket}
              collection={collection} />
          );
        })
      }
      <AdminLink name="collection:create" params={{bid: bucket.id}} className={active(`/buckets/${bucket.id}/collections/create`)}>
        <i className="glyphicon glyphicon-plus"/>
        Create collection
      </AdminLink>
    </div>
  );
}

function BucketsMenu(props) {
  const {active, buckets, bid, cid} = props;
  return (
    <div>
      <div className="panel panel-default">
        <div className="list-group">
          <AdminLink name="bucket:create" className={active("/buckets/create")}>
            <i className="glyphicon glyphicon-plus"/>
            Create bucket
          </AdminLink>
        </div>
      </div>
      {
        buckets.map((bucket, i) => {
          const {id, collections} = bucket;
          const current = bid === id;
          return (
            <div key={i} className="panel panel-default bucket-menu">
              <div className="panel-heading">
                <i className={`glyphicon glyphicon-folder-${current ? "open" : "close"}`} />
                <strong>{id}</strong> bucket
                <AdminLink name="bucket:attributes" params={{bid: id}}
                  className="bucket-menu-entry-edit"
                  title="Manage bucket">
                  <i className="glyphicon glyphicon-cog"/>
                </AdminLink>
              </div>
              <BucketCollectionsMenu
                bucket={bucket}
                collections={collections}
                active={active}
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
    const {bid, cid} = params;
    const {buckets=[]} = session;
    const active = activeIfPathname.bind(null, location);
    return (
      <div>
        <div className="panel panel-default">
          <div className="list-group">
            <AdminLink name="home" className={active("/")}>Home</AdminLink>
          </div>
        </div>
        {session.authenticated ?
          <BucketsMenu
            buckets={buckets}
            active={active}
            bid={bid}
            cid={cid} /> : null}
      </div>
    );
  }
}
