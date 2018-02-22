/* @flow */

import type { RouteParams } from "../types";

import { PureComponent } from "react";
import * as React from "react";
import { Link } from "react-router";

import url from "../url";

type Props = {
  name: string,
  params: RouteParams,
  children?: React.Node,
};

export default class AdminLink extends PureComponent<Props> {
  render() {
    const { children, name, params, ...linkProps } = this.props;
    return (
      <Link {...linkProps} to={url(name, params)}>
        {children}
      </Link>
    );
  }
}
