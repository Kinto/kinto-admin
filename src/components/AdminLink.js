/* @flow */

import type { RouteParams } from "../types";

import React, { Component } from "react";
import { Link } from "react-router";

import url from "../url";


type Props = {
  name: string,
  params: RouteParams,
  children: any,
};

export default class AdminLink extends Component {
  props: Props;

  render() {
    const {children, name, params, query, ...linkProps} = this.props;
    const pathname = url(name, params);
    return (
      <Link {...linkProps} to={{pathname, query}}>{children}</Link>
    );
  }
}
