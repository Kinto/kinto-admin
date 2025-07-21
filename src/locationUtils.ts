import zip from "lodash/zip";

/**
 * Given a pathname, return a 2d array where each inner array is the path
 * part's name and location
 *
 * "/"        => [["home", "/"]]
 * "/foo"     => [["home", "/"], ["foo", "/foo"]]
 * "/foo/bar" => [["home", "/"], ["foo", "/foo"], ["bar", "/foo/bar"]]
 */
export function breadcrumbifyPath(path: string) {
  const crumbNames = path.split("/").filter(Boolean);
  const pathParts = [""];
  const crumbPaths = crumbNames.map(name => {
    pathParts.push(name);
    return pathParts.join("/");
  });
  return [["home", "/"]].concat(zip(crumbNames, crumbPaths));
}

// This may become obsolete when upgrading or switching router packages. Functionality
// is not built in to react-router v5, useSearchParams exists in v6 though.
export function parseSearchString(search?: string): Record<string, any> {
  if (!search || !search.startsWith("?")) {
    return {};
  }
  const params = {};
  const keyVals = search.substring(1).split("&");
  for (const kv of keyVals) {
    const [key, val] = kv.split("=");
    if (key) {
      params[decodeURIComponent(key)] = val ? decodeURIComponent(val) : true;
    }
  }
  return params;
}
