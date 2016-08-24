import React, { Component } from "react";
import { Link } from "react-router";


export default class CollectionTabs extends Component {
  render() {
    const {bid, cid, selected, capabilities, children} = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li role="presentation" className={selected === "records" ? "active" : ""}>
            <Link to={`/buckets/${bid}/collections/${cid}`}>Records</Link>
          </li>
          {"history" in capabilities ?
            <li role="presentation" className={selected === "history" ? "active" : ""}>
              <Link to={`/buckets/${bid}/collections/${cid}/history`}>History</Link>
            </li> : null}
          <li role="presentation" className={selected === "settings" ? "active" : ""}>
            <Link to={`/buckets/${bid}/collections/${cid}/edit`}>Settings</Link>
          </li>
        </ul>
        <div className="panel panel-default">
          <div className="panel-body">
            {children}
          </div>
        </div>
      </div>
    );
  }
}
