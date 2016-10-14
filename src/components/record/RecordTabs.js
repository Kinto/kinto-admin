import React, { Component } from "react";

import AdminLink from "../AdminLink";


export default class RecordTabs extends Component {
  render() {
    const {bid, cid, rid, selected, capabilities, children} = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li role="presentation" className={selected === "attributes" ? "active" : ""}>
            <AdminLink name="record:attributes" params={{bid, cid, rid}}>
              <i className="glyphicon glyphicon-cog" />
              Attributes
            </AdminLink>
          </li>
          <li role="presentation" className={selected === "permissions" ? "active" : ""}>
            <AdminLink name="record:permissions" params={{bid, cid, rid}}>
              <i className="glyphicon glyphicon-lock" />
              Permissions
            </AdminLink>
          </li>
          {"history" in capabilities ?
            <li role="presentation" className={selected === "history" ? "active" : ""}>
              <AdminLink name="record:history" params={{bid, cid, rid}}>
                <i className="glyphicon glyphicon-time" />
                History
              </AdminLink>
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
