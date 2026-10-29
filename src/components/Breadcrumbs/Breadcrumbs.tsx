import "./style.css";
import { breadcrumbifyPath } from "@src/locationUtils";
import { NavLink, useLocation } from "react-router";

export default function Breadcrumbs() {
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
            {i < crumbs.length - 1 ? <span> / </span> : null}
          </span>
        ))}
      </div>
    </nav>
  );
}
