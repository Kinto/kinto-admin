import React, { Component } from "react";
import { Link } from "react-router";


function activeIfPathname(location, pathname) {
  const active = location.pathname === pathname ? "active" : "";
  return `list-group-item ${active}`;
}

function BucketCollectionsMenu(props) {
  const {active, currentPath, bucket, collections, bid, cid} = props;
  return (
    <div className="collections-menu list-group">
      {
        collections.map((collection, i) => {
          const {id} = collection;
          const classes = [
            "list-group-item",
            "collections-menu-entry",
            bid === bucket.id && cid === id ? "active" : "",
          ].join(" ");
          const listPath = `/buckets/${bucket.id}/collections/${id}`;
          return (
            <div key={i} className={classes}>
              <i className="glyphicon glyphicon-align-justify"/>
              {
                currentPath === listPath ? id : <Link to={listPath}>{id}</Link>
              }
              <Link to={`/buckets/${bucket.id}/collections/${id}/edit`}
                className="collections-menu-entry-edit"
                title="Edit collection properties">
                <i className="glyphicon glyphicon-cog"/>
              </Link>
            </div>
          );
        })
      }
      <Link className={active(`/buckets/${bucket.id}/create-collection`)}
        to={`/buckets/${bucket.id}/create-collection`}>
        <i className="glyphicon glyphicon-plus"/>
        Create collection
      </Link>
    </div>
  );
}

function BucketsMenu(props) {
  const {active, currentPath, buckets, userBucket, bid, cid} = props;
  return (
    <div>
      <div className="panel panel-default">
        <div className="list-group">
          <Link to="/buckets/create-bucket" className={active("/buckets/create-bucket")}>
            <i className="glyphicon glyphicon-plus"/>
            Create bucket
          </Link>
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
                <strong>{id === userBucket ? "default" : id}</strong> bucket
                <Link to={`/buckets/${id}/edit`}
                  className="bucket-menu-entry-edit"
                  title="Manage bucket">
                  <i className="glyphicon glyphicon-cog"/>
                </Link>
              </div>
              <BucketCollectionsMenu
                bucket={bucket}
                collections={collections}
                active={active}
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
    const {bid, cid} = params;
    const {buckets=[], serverInfo={}} = session;
    const userBucket = serverInfo.user && serverInfo.bucket;
    const active = activeIfPathname.bind(null, location);
    return (
      <div>
        <div className="panel panel-default">
          <div className="list-group">
            <Link to="/" className={active("/")}>Home</Link>
          </div>
        </div>
        {session.authenticated ?
          <BucketsMenu
            buckets={buckets}
            userBucket={userBucket}
            active={active}
            currentPath={location.pathname}
            bid={bid}
            cid={cid} /> : null}
      </div>
    );
  }
}
