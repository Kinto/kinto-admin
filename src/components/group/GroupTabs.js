import React, { Component } from "react";
import { Link } from "react-router";


export default class GroupTabs extends Component {
  render() {
    const {bid, gid, selected, capabilities, children} = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          {"history" in capabilities ?
            <li role="presentation" className={selected === "history" ? "active" : ""}>
              <Link to={`/buckets/${bid}/groups/${gid}/history`}>
                <i className="glyphicon glyphicon-time" />
                History
              </Link>
            </li> : null}
          <li role="presentation" className={selected === "permissions" ? "active" : ""}>
            <Link to={`/buckets/${bid}/groups/${gid}/permissions`}>
              <i className="glyphicon glyphicon-lock" />
              Permissions
            </Link>
          </li>
          <li role="presentation" className={selected === "settings" ? "active" : ""}>
            <Link to={`/buckets/${bid}/groups/${gid}/edit`}>
              <i className="glyphicon glyphicon-cog" />
              Properties
            </Link>
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
