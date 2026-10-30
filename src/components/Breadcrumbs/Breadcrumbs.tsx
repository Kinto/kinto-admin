import "./style.css";
import { NavLink, useLocation } from "react-router";

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  let path = "";
  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map(name => {
      path += "/" + name;
      return { name, path };
    });
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
