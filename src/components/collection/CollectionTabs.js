import React, { Component } from "react";

import AdminLink from "../AdminLink";


export default class CollectionTabs extends Component {
  render() {
    const {bid, cid, selected, capabilities, children} = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li role="presentation" className={selected === "records" ? "active" : ""}>
            <AdminLink name="collection:records" params={{bid, cid}}>
              <i className="glyphicon glyphicon-align-justify" />
              Records
            </AdminLink>
          </li>
          <li role="presentation" className={selected === "attributes" ? "active" : ""}>
            <AdminLink name="collection:attributes" params={{bid, cid}}>
              <i className="glyphicon glyphicon-cog" />
              Attributes
            </AdminLink>
          </li>
          <li role="presentation" className={selected === "permissions" ? "active" : ""}>
            <AdminLink name="collection:permissions" params={{bid, cid}}>
              <i className="glyphicon glyphicon-lock" />
              Permissions
            </AdminLink>
          </li>
          {"history" in capabilities ?
            <li role="presentation" className={selected === "history" ? "active" : ""}>
              <AdminLink name="collection:history" params={{bid, cid}}>
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
