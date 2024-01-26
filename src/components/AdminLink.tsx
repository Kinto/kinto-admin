import type { RouteParams } from "@src/types";
import url from "@src/url";
import { PureComponent } from "react";
import * as React from "react";
import { Link } from "react-router-dom";

type Props = Omit<React.ComponentProps<typeof Link>, "to"> & {
  name: string;
  params: RouteParams;
  children?: React.ReactNode;
  query?: any;
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
