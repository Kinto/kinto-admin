import React, { Component} from "react";
import { Link } from "react-router";

export default class Sidebar extends Component {
  activeIfPathname(pathname) {
    return this.props.location.pathname === pathname ? "active" : "";
  }

  render() {
    const {collections, params} = this.props;
    return (
      <ul>
        <li className={this.activeIfPathname("/")}>
          <Link to="/">Home</Link>
        </li>
        <li className={this.activeIfPathname("/settings")}>
          <Link to="/settings">Settings</Link>
        </li>
        <hr/>
        {
          Object.keys(collections).map((name, index) => {
            return (
              <li key={index}
                className={params.name === name ? "active" : ""}>
                <Link to={`/collections/${name}`}
                  className={collections[name].synced ? "synced" : "unsynced"}>
                  {name}
                </Link>
              </li>
            );
          })
        }
      </ul>
    );
  }
}
