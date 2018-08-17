/* @flow */

import type { RouteParams } from "../types";

import { PureComponent } from "react";
import * as React from "react";
import { Link } from "react-router-dom";

import url from "../url";

type Props = {
  name: string,
  params: RouteParams,
  children?: React.Node,
  query?: Object,
};

export default class AdminLink extends PureComponent<Props> {
  render() {
    const { children, name, params, ...linkProps } = this.props;
    const toUrl = url(name, params);
    const to = linkProps.query
      ? `${toUrl}?${new URLSearchParams(linkProps.query).toString()}`
      : toUrl;
    return (
      <Link {...linkProps} to={to}>
        {children}
      </Link>
    );
  }
}
