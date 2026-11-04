import "./style.css";
import { NavLink, useLocation } from "react-router";

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const names = pathname.split("/").filter(Boolean);
  const crumbs = names.map((name, i) => ({
    name,
    path: "/" + names.slice(0, i + 1).join("/"),
  }));
  return (
    <nav className="breadcrumbs">
      <div>
        <NavLink to="/">home</NavLink>
        {crumbs.map(({ name, path }) => (
          <span key={path}>
            <span> / </span>
            <NavLink to={path}>{name}</NavLink>
          </span>
        ))}
      </div>
    </nav>
  );
}
