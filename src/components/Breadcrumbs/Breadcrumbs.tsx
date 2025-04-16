import "./style.css";
import { breadcrumbifyPath } from "@src/locationUtils";
import React from "react";
import { NavLink, useLocation } from "react-router";

interface BreadcrumbsProps {
  separator: string;
}

export default function Breadcrumbs({ separator }: BreadcrumbsProps) {
  const { pathname } = useLocation();
  const crumbs = breadcrumbifyPath(pathname);
  return (
    <nav className={"breadcrumbs"}>
      <div>
        {crumbs.map(([name, path], i) => (
          <span key={i}>
            <NavLink
              to={{
                pathname: path,
              }}
            >
              {name}
            </NavLink>
            {i < crumbs.length - 1 ? <span>{separator}</span> : null}
          </span>
        ))}
      </div>
    </nav>
  );
}
