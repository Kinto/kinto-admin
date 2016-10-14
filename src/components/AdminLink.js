import React, { Component } from "react";
import { Link } from "react-router";

import url from "../url";


export default class AdminLink extends Component {
  render() {
    const {children, className, name, params} = this.props;
    return (
      <Link className={className}
            to={url(name, params)}>{children}</Link>
    );
  }
}
