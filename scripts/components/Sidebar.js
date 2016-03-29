import React, { Component} from "react";
import { Link } from "react-router";

export default class Sidebar extends Component {
  activeIfPathname(pathname) {
    const active = this.props.location.pathname === pathname ? "active" : "";
    return `list-group-item ${active}`;
  }

  render() {
    const {collections, params} = this.props;
    return (
      <div>
        <h1>Kinto admin</h1>
        <div className="panel panel-default">
          <div className="list-group">
            <Link to="/" className={this.activeIfPathname("/")}>Home</Link>
            <Link to="/settings"
              className={this.activeIfPathname("/settings")}>Settings</Link>
          </div>
        </div>

        <div className="panel panel-default">
        <div className="panel-heading">
          Collections
        </div>
          <div className="list-group">{
            Object.keys(collections).map((name, i) => {
              const classes = [
                "list-group-item",
                params.name === name ? "active" : "",
              ].join(" ");
              return (
                <Link key={i} to={`/collections/${name}`} className={classes}>
                  {name + (!collections[name].synced ? "*" : "")}
                </Link>
              );
            })
          }</div>
        </div>
      </div>
    );
  }
}
