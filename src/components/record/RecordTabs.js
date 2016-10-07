import React, { Component } from "react";
import { Link } from "react-router";


export default class RecordTabs extends Component {
  render() {
    const {bid, cid, rid, selected, capabilities, children} = this.props;

    return (
      <div className="tabs-container">
        <ul className="nav nav-tabs nav-justified">
          <li role="presentation" className={selected === "settings" ? "active" : ""}>
            <Link to={`/buckets/${bid}/collections/${cid}/records/${rid}/edit`}>
              <i className="glyphicon glyphicon-cog" />
              Attributes
            </Link>
          </li>
          {"history" in capabilities ?
            <li role="presentation" className={selected === "history" ? "active" : ""}>
              <Link to={`/buckets/${bid}/collections/${cid}/records/${rid}/history`}>
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
