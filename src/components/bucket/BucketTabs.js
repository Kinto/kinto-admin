import React, { Component } from "react";
import { Link } from "react-router";


export default class BucketTabs extends Component {
  render() {
    const {bid, selected, capabilities, children} = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li role="presentation" className={selected === "collections" ? "active" : ""}>
            <Link to={`/buckets/${bid}/collections`}>
              <i className="glyphicon glyphicon-align-justify" />
              Collections
            </Link>
          </li>
          <li role="presentation" className={selected === "groups" ? "active" : ""}>
            <Link to={`/buckets/${bid}/groups`}>
              <i className="glyphicon glyphicon-user" />
              Groups
            </Link>
          </li>
          <li role="presentation" className={selected === "settings" ? "active" : ""}>
            <Link to={`/buckets/${bid}/attributes`}>
              <i className="glyphicon glyphicon-cog" />
              Attributes
            </Link>
          </li>
          <li role="presentation" className={selected === "permissions" ? "active" : ""}>
            <Link to={`/buckets/${bid}/permissions`}>
              <i className="glyphicon glyphicon-lock" />
              Permissions
            </Link>
          </li>
          {"history" in capabilities ?
            <li role="presentation" className={selected === "history" ? "active" : ""}>
              <Link to={`/buckets/${bid}/history`}>
                <i className="glyphicon glyphicon-time" />
                History
              </Link>
            </li> : null}
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
