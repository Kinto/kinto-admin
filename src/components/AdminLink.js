import React, { Component } from "react";
import { Link } from "react-router";

import url from "../url";


export default class AdminLink extends Component {
  render() {
    const {children, name, params, ...linkProps} = this.props;
    return (
      <Link {...linkProps} to={url(name, params)}>{children}</Link>
    );
  }
}
