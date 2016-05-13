import React from "react";
import { Link } from "react-router";


function BucketCollectionsMenu(props) {
  const {bucket, collections} = props;
  return (
    <div className="list-group">
      {
        collections.map((collection, i) => {
          const {id} = collection;
          const active = false; // selectedBucket === bucket.id && selectedCollection === id
          const classes = [
            "list-group-item",
            active ? "active" : "",
          ].join(" ");
          return (
            <Link key={i} to={`/buckets/${bucket.id}/collections/${id}`}
              className={classes}>{id}</Link>
          );
        })
      }
      <Link to={`/buckets/${bucket.id}/create-collection`}
        className="list-group-item">
        <i className="glyphicon glyphicon-plus"/>
        Create collection
      </Link>
    </div>
  );
}

function BucketsMenu(props) {
  const {buckets} = props;
  return (
    <div>{
      buckets.map((bucket, i) => {
        const {id, collections} = bucket;
        return (
          <div key={i} className="panel panel-default">
            <div className="panel-heading"><strong>{id}</strong> bucket</div>
            <BucketCollectionsMenu
              bucket={bucket}
              collections={collections} />
          </div>
        );
      })
    }</div>
  );
}

export default function Sidebar(props) {
  function activeIfPathname(pathname) {
    const active = props.location.pathname === pathname ? "active" : "";
    return `list-group-item ${active}`;
  }

  const {collections, params, session} = props;
  const {buckets} = session;
  return (
    <div>
      <div className="panel panel-default">
        <div className="list-group">
          <Link to="/" className={activeIfPathname("/")}>Home</Link>
          <Link to="/settings"
            className={activeIfPathname("/settings")}>Settings</Link>
        </div>
      </div>

      <BucketsMenu buckets={buckets} />
    </div>
  );
}
