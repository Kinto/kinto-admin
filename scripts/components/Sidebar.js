import React, { Component } from "react";
import { Link } from "react-router";


function BucketCollectionsMenu(props) {
  const {bucket, collections, bid, cid} = props;
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
          return (
            <div key={i} className={classes}>
              <i className="glyphicon glyphicon-align-justify"/>
              <Link to={`/buckets/${bucket.id}/collections/${id}`}>{id}</Link>
              <Link to={`/buckets/${bucket.id}/collections/${id}/edit`}
                className="collections-menu-entry-edit"
                title="Edit collection properties">
                <i className="glyphicon glyphicon-cog"/>
              </Link>
            </div>
          );
        })
      }
      <Link className="list-group-item"
        to={`/buckets/${bucket.id}/create-collection`}>
        <i className="glyphicon glyphicon-plus"/>
        Create collection
      </Link>
    </div>
  );
}

function BucketsMenu(props) {
  const {buckets, bid, cid} = props;
  return (
    <div>{
      buckets.map((bucket, i) => {
        const {id, collections} = bucket;
        const current = bid === id;
        return (
          <div key={i} className="panel panel-default">
            <div className="panel-heading">
              <i className={`glyphicon glyphicon-folder-${current ? "open" : "close"}`} />
              <strong>{id}</strong> bucket
            </div>
            <BucketCollectionsMenu
              bucket={bucket}
              collections={collections}
              bid={bid}
              cid={cid} />
          </div>
        );
      })
    }</div>
  );
}

export default class Sidebar extends Component {
  render() {
    const {session, params, location} = this.props;
    const {bid, cid} = params;

    function activeIfPathname(pathname) {
      const active = location.pathname === pathname ? "active" : "";
      return `list-group-item ${active}`;
    }

    const {buckets} = session;
    return (
      <div>
        <div className="panel panel-default">
          <div className="list-group">
            <Link to="/" className={activeIfPathname("/")}>Home</Link>
          </div>
        </div>

        <BucketsMenu buckets={buckets} bid={bid} cid={cid} />
      </div>
    );
  }
}
