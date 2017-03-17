/* @flow */

import type { RouteParams } from "../types";

import React, { PureComponent } from "react";
import { Link } from "react-router";

import url from "../url";

type Props = {
  name: string,
  params: RouteParams,
  children?: React.Element<*>,
};

export default class AdminLink extends PureComponent {
  props: Props;

  render() {
    const { children, name, params, ...linkProps } = this.props;
    return <Link {...linkProps} to={url(name, params)}>{children}</Link>;
  }
}
